// Filing Centre data access. Filing state, XML and evidence logic live in src/lib/filing.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logEstateEvent } from "@/hooks/useEstateRecords";
import { fieldsFor } from "@/components/estate/forms/FormDetails";
import { buildXml } from "@/lib/filing/xmlBuilder";
import { sealPack, sha256 } from "@/lib/filing/evidence";
import type { FieldMapping, FilingStatus, Payload, SchemaElement } from "@/lib/filing/types";
import type { Readiness } from "@/lib/filing/checks";
import { deadlineOutcome } from "@/lib/filing/status";

const db = supabase as unknown as { from: (t: string) => any; auth: typeof supabase.auth };

export interface OsbFiling {
  id: string; estate_id: string; form_number: string; version_label: string; status: FilingStatus;
  amends_filing_id: string | null; payload: Payload; xml: string | null; xml_sha256: string | null;
  readiness: Partial<Readiness>; signed_by: string | null; signed_at: string | null; osb_reference: string | null;
  osb_response: any; responded_at: string | null; deadline: string | null; deadline_outcome: string | null;
  late_reason: string | null; created_at: string; updated_at: string; estates?: { debtor_name: string; file_number: string | null; estate_type: string } | null;
}
export interface SchemaVersion { id: string; form_number: string; version_label: string; namespace: string | null; source_url: string | null; loaded_at: string; effective_from: string | null }

export const useOsbFilings = (estateId?: string) =>
  useQuery({
    queryKey: ["osb_filings", estateId ?? "all"],
    queryFn: async (): Promise<OsbFiling[]> => {
      let q = db.from("osb_filings").select("*, estates(debtor_name, file_number, estate_type)").order("updated_at", { ascending: false });
      if (estateId) q = q.eq("estate_id", estateId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export const useOsbFiling = (id?: string) =>
  useQuery({
    queryKey: ["osb_filing", id], enabled: Boolean(id),
    queryFn: async () => {
      const [f, ev, pack] = await Promise.all([
        db.from("osb_filings").select("*, estates(debtor_name, file_number, estate_type)").eq("id", id).maybeSingle(),
        db.from("osb_filing_events").select("*").eq("filing_id", id).order("at"),
        db.from("osb_evidence_packs").select("*").eq("filing_id", id).maybeSingle(),
      ]);
      if (f.error) throw f.error;
      return { filing: f.data as OsbFiling | null, events: (ev.data ?? []) as any[], pack: pack.data as any };
    },
  });

export const useOsbSchemas = () =>
  useQuery({
    queryKey: ["osb_schemas"],
    queryFn: async () => {
      const [v, e, m] = await Promise.all([
        db.from("osb_schema_versions").select("*").order("form_number"),
        db.from("osb_schema_elements").select("*"),
        db.from("osb_field_mappings").select("*"),
      ]);
      if (v.error) throw v.error;
      return { versions: (v.data ?? []) as SchemaVersion[], elements: (e.data ?? []) as (SchemaElement & { schema_version_id: string })[], mappings: (m.data ?? []) as FieldMapping[] };
    },
  });

export const schemaFor = (s: ReturnType<typeof useOsbSchemas>["data"], form: string, version: string) => {
  const v = s?.versions.find((x) => x.form_number === form && x.version_label === version) ?? null;
  return { version: v, elements: v ? s!.elements.filter((e) => e.schema_version_id === v.id) : [], mappings: s?.mappings ?? [] };
};

/** Payload built from estate records (repeating groups from real rows, never typed). */
export const buildPayload = async (estateId: string, formNumber: string): Promise<Payload> => {
  const [{ data: estate }, { data: creditors }, { data: assets }] = await Promise.all([
    db.from("estates").select("*").eq("id", estateId).maybeSingle(),
    db.from("estate_creditors").select("legal_name, province, soa_amount, creditor_type").eq("estate_id", estateId),
    db.from("estate_assets").select("*").eq("estate_id", estateId),
  ]);
  const p: Payload = {};
  for (const f of fieldsFor(formNumber)) p[f.key] = estate?.[f.key] ?? null;
  p.debtor_kind = estate?.debtor_kind ?? null;
  p.Creditor = (creditors ?? []).map((c: any) => ({ Name: c.legal_name, Province: c.province, Amount: c.soa_amount, Type: c.creditor_type }));
  p.Asset = (assets ?? []).map((a: any) => ({ Description: a.description ?? a.asset_type ?? null, Value: a.estimated_value ?? a.value ?? null }));
  return p;
};

const addEvent = (f: { id: string; estate_id: string }, from: string | null, to: string, detail?: string) =>
  db.from("osb_filing_events").insert({ filing_id: f.id, estate_id: f.estate_id, from_status: from, to_status: to, detail });

const useInvalidate = () => {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries({ queryKey: ["osb_filings"] }); qc.invalidateQueries({ queryKey: ["osb_filing"] }); };
};
const fail = (title: string) => (e: Error) => toast({ title, description: e.message, variant: "destructive" });

export const useCreateFiling = () => {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async (a: { estateId: string; formNumber: string; versionLabel: string; deadline?: string | null; amendsId?: string | null }) => {
      const payload = await buildPayload(a.estateId, a.formNumber);
      const { data, error } = await db.from("osb_filings").insert({ estate_id: a.estateId, form_number: a.formNumber, version_label: a.versionLabel, deadline: a.deadline ?? null, amends_filing_id: a.amendsId ?? null, payload }).select().single();
      if (error) throw error;
      await addEvent(data, null, "drafted", a.amendsId ? "Amendment drafted" : "Filing drafted from estate records");
      await logEstateEvent({ estateId: a.estateId, eventType: "filing.drafted", after: { filing: data.id, form: a.formNumber } });
      return data as OsbFiling;
    },
    onSuccess: () => { inv(); toast({ title: "Filing drafted", description: "Open it in the Filing Centre to run checks." }); },
    onError: fail("Could not draft filing"),
  });
};

export const useSaveChecks = () => {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async ({ filing, readiness, elements, namespace }: { filing: OsbFiling; readiness: Readiness; elements: SchemaElement[]; namespace: string | null }) => {
      const payload = await buildPayload(filing.estate_id, filing.form_number);
      const xml = elements.length ? buildXml(filing.form_number.replace(/\s/g, ""), namespace, elements, payload) : null;
      const to = readiness.state === "blocked" ? filing.status : "checked";
      const { error } = await db.from("osb_filings").update({ payload, xml, xml_sha256: xml ? await sha256(xml) : null, readiness, status: to }).eq("id", filing.id);
      if (error) throw error;
      await addEvent(filing, filing.status, to, `Checks: ${readiness.state} (${readiness.issues.length} issue(s))`);
    },
    onSuccess: inv, onError: fail("Could not save checks"),
  });
};

export const useSignFiling = () => {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async ({ filing, pdfBlob }: { filing: OsbFiling; pdfBlob?: Blob | null }) => {
      if (filing.status !== "checked") throw new Error("Run the checks first.");
      if ((filing.readiness?.issues ?? []).length) throw new Error("Resolve the remaining issues before signing.");
      const { data: auth } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const { data: signed, error } = await db.from("osb_filings").update({ status: "signed", signed_by: auth.user?.id, signed_at: now }).eq("id", filing.id).select().single();
      if (error) throw error;
      await addEvent(filing, "checked", "signed", "Signed by trustee");
      const { data: events } = await db.from("osb_filing_events").select("*").eq("filing_id", filing.id).order("at");
      const pdfSha = pdfBlob ? await sha256(Array.from(new Uint8Array(await pdfBlob.arrayBuffer())).join(",")) : null;
      const { pack, pack_sha256 } = await sealPack({
        filing_id: filing.id, estate_id: filing.estate_id, form_number: filing.form_number, version_label: filing.version_label,
        schema_version_id: null, rules_version: "estate-compliance@1", xml: signed.xml, xml_sha256: signed.xml_sha256,
        payload: signed.payload, checks: signed.readiness, signer: auth.user?.id ?? null, signed_at: now,
        osb_reference: null, osb_response: null, events: [...(events ?? []), { pdf_sha256: pdfSha }],
      });
      const { data: doc } = await db.from("documents").insert({
        title: `${filing.form_number} evidence pack (${filing.version_label})`, type: "osb_evidence_pack", user_id: auth.user?.id,
        metadata: { estate_id: filing.estate_id, role: "evidence_pack", filing_id: filing.id, form_number: filing.form_number, pack_sha256 },
      }).select("id").single();
      const { error: pErr } = await db.from("osb_evidence_packs").insert({ filing_id: filing.id, estate_id: filing.estate_id, pack, pack_sha256, document_id: doc?.id ?? null });
      if (pErr) throw new Error(`Signed, but sealing the evidence pack failed: ${pErr.message}`);
      await logEstateEvent({ estateId: filing.estate_id, eventType: "filing.signed", after: { filing: filing.id, pack_sha256 } });
    },
    onSuccess: () => { inv(); toast({ title: "Signed and sealed", description: "Evidence pack saved to Documents." }); },
    onError: fail("Could not sign"),
  });
};

export const useRecordOsbResponse = () => {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async ({ filing, outcome, reference, receivedOn, message, lateReason }: { filing: OsbFiling; outcome: "acknowledged" | "accepted" | "rejected"; reference: string; receivedOn: string; message?: string; lateReason?: string }) => {
      const outcomeDl = outcome === "accepted" ? deadlineOutcome(filing.deadline, receivedOn) : null;
      if (outcomeDl === "late" && !lateReason?.trim()) throw new Error("This filing is late — record the reason.");
      const { error } = await db.from("osb_filings").update({
        status: outcome, osb_reference: reference.trim(), responded_at: receivedOn, osb_response: { outcome, message: message ?? null, recorded_manually: true },
        deadline_outcome: outcomeDl, late_reason: outcomeDl === "late" ? lateReason : null,
      }).eq("id", filing.id);
      if (error) throw error;
      await addEvent(filing, filing.status, outcome, `OSB ${outcome}: ${reference}${message ? ` — ${message}` : ""}`);
      await logEstateEvent({ estateId: filing.estate_id, eventType: `filing.${outcome}`, after: { filing: filing.id, reference, deadline_outcome: outcomeDl } });
    },
    onSuccess: () => { inv(); toast({ title: "OSB response recorded" }); },
    onError: fail("Could not record response"),
  });
};

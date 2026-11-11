// Phase 8 — form catalogue, parameter capture, generation and filing state.
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import { logEstateEvent } from "@/hooks/useEstateRecords";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";
import { useEstateDates, useEstateRow } from "@/hooks/useEstateRecords";
import {
  DataSource,
  FORM_DEFS,
  FlagAck,
  FormDef,
  FormEvaluation,
  adminType as toAdminType,
  estateKind,
  evaluateForm,
  signRefusal,
} from "@/lib/forms/formEngine";

const db = supabase as unknown as { from: (table: string) => any };

export type FormCatalogueEntry = FormDef;
export const FORM_CATALOGUE = FORM_DEFS;

export interface FormInstanceRow {
  id: string;
  estate_id: string;
  form_number: string;
  title: string | null;
  status: string;
  validation_state: string;
  parameters: Record<string, unknown>;
  signing_date: string | null;
  generated_at: string | null;
  filed_at: string | null;
  document_id?: string | null;
  validation_messages?: unknown;
  created_at?: string;
}

export interface FormCatalogueItem extends FormCatalogueEntry {
  instance?: FormInstanceRow;
  status: string;
  validation: "Passed" | "Blocked";
  blockers: string[];
  evaluation: FormEvaluation;
  acks: FlagAck[];
}

const readAcks = (v: unknown): FlagAck[] =>
  Array.isArray(v) ? (v.filter((x) => x && typeof x === "object" && "flag" in x) as FlagAck[]) : [];

const LEGACY_NUMBERS: Record<string, string[]> = { "Form 21": ["Form 1"], "Form 68": ["Form 67"], "Form 79": ["Form 66"] };

const FILING_DATE_TYPES = ["Insolvency Date", "Date Assignment Filed", "Date Proposal Filed", "Filing Date"];

export const useFormInstances = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_form_instances", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<FormInstanceRow[]> => {
      const { data, error } = await db
        .from("estate_form_instances")
        .select("*")
        .eq("estate_id", estateId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FormInstanceRow[];
    },
  });

/** Merges the catalogue with persisted instances, live compliance gates and the form engine. */
export const useEstateForms = (estateId?: string) => {
  const { data: instances = [], isLoading } = useFormInstances(estateId);
  const { rules } = useEstateCompliance(estateId);
  const { data: estate } = useEstateRow(estateId);
  const { data: dates = [] } = useEstateDates(estateId);

  const items = useMemo<FormCatalogueItem[]>(() => {
    const row = estate as Record<string, any> | null | undefined;
    const failing: Record<string, string> = {};
    rules.filter((r) => r.state !== "pass").forEach((r) => (failing[r.id] = r.rule));
    const filingRow = dates.find((d) => d.date_value && FILING_DATE_TYPES.includes(d.date_type));
    const filingDate: string | null = row?.insolvency_date ?? filingRow?.date_value ?? null;
    // Appointment-based deadlines use only a recorded appointment date; never the filing date.
    const apptRow = dates.find((d) => d.date_value && /appoint/i.test(d.date_type));
    const appointmentDate: string | null = row?.appointment_date ?? apptRow?.date_value ?? null;
    const admin = toAdminType(row?.administration_type);
    const unverifiedSources: DataSource[] = dates.some(
      (d) => d.date_value && /extract|ai|bank/i.test(d.source_type ?? "") && !(d as any).confirmed_by,
    )
      ? ["Estate dates"]
      : [];
    const kind = estateKind(row?.estate_type);
    const today = new Date();
    return FORM_DEFS.map((def) => {
      // Records saved under the earlier, incorrect numbers stay attached without rewriting stored data.
      const legacy = LEGACY_NUMBERS[def.number] ?? [];
      const instance = instances.find((i) => i.form_number === def.number) ?? instances.find((i) => legacy.includes(i.form_number));
      const acks = readAcks(instance?.validation_messages);
      const ev = (instance?.parameters as any)?.osb_evidence;
      const osbEvidence = ev?.reference ? { reference: String(ev.reference), received_at: String(ev.received_at ?? "") } : null;
      const evaluation = evaluateForm({ def, kind, filingDate, appointmentDate, adminType: admin, failing, unverifiedSources, instance, acks, today, osbEvidence });
      return {
        ...def,
        title: evaluation.title,
        instance,
        acks,
        evaluation,
        status: evaluation.status ?? "Not applicable",
        validation: evaluation.blockers.length ? "Blocked" : "Passed",
        blockers: evaluation.blockers,
      };
    });
  }, [instances, rules, estate, dates]);

  return { items, isLoading };
};

export const formToValues = (item: FormCatalogueItem): RecordValues => ({
  formNumber: item.number,
  formName: item.title,
  eFile: true,
  signingDate: item.instance?.signing_date ?? "",
  ...((item.instance?.parameters as RecordValues) ?? {}),
});

export const useSaveFormInstance = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      item,
      values,
      generate,
      file,
    }: {
      item: FormCatalogueItem;
      values: RecordValues;
      generate?: boolean;
      file?: boolean;
    }) => {
      if (!estateId) throw new Error("No estate selected.");
      if (file) {
        const refusal = signRefusal(item.evaluation);
        if (refusal) throw new Error(refusal);
      }
      if (generate && item.blockers.length) {
        throw new Error(`Blocked by: ${item.blockers.join(", ")}`);
      }
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in to work on estates.");
      const now = new Date().toISOString();
      const row = {
        form_number: item.number,
        title: item.title,
        parameters: values as Record<string, unknown>,
        signing_date: values.signingDate ? String(values.signingDate) : null,
        validation_state: item.blockers.length ? "blocked" : "passed",
        status: file ? "signed" : generate ? "generated" : "draft",
        generated_at: generate || file ? (item.instance?.generated_at ?? now) : item.instance?.generated_at ?? null,
        // Signing is internal preparation; filed_at is only set when OSB evidence is recorded.
        filed_at: item.instance?.filed_at ?? null,
      };
      const query = item.instance
        ? db.from("estate_form_instances").update(row).eq("id", item.instance.id)
        : db
            .from("estate_form_instances")
            .insert({ ...row, estate_id: estateId, user_id: auth.user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      if (file && !item.instance?.document_id) {
        // File the signed copy into the estate's Documents automatically.
        const { data: doc, error: docError } = await db
          .from("documents")
          .insert({
            title: `${item.number} — ${item.title}${item.evaluation.period ? ` (${item.evaluation.period})` : ""}`,
            type: "estate_form",
            user_id: auth.user.id,
            metadata: {
              estate_id: estateId,
              role: "signed",
              form_number: item.number,
              form_instance_id: data.id,
              version: item.evaluation.version.label,
              osb_status: "not_submitted",
            },
          })
          .select("id")
          .single();
        if (docError) throw new Error(`Form signed but saving the copy to Documents failed: ${docError.message}`);
        await db.from("estate_form_instances").update({ document_id: doc.id }).eq("id", data.id);
      }
      await logEstateEvent({
        estateId,
        eventType: `estate.form.${file ? "signed" : generate ? "generated" : "saved"}`,
        after: { form: item.number, status: row.status },
      });
      return data as FormInstanceRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["estate_form_instances", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-events", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-filed-documents", estateId] });
      toast({
        title: vars.file ? "Form signed — record OSB evidence to mark it filed" : vars.generate ? "Form generated" : "Parameters saved",
      });
    },
    onError: (e: Error) =>
      toast({ title: "Form action failed", description: e.message, variant: "destructive" }),
  });
};
/** Acknowledge a flag with a written reason; stored on the form instance and audit-logged. */
export const useAcknowledgeFlag = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ item, flag, reason }: { item: FormCatalogueItem; flag: string; reason: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      if (reason.trim().length < 5) throw new Error("Write a reason of at least a few words.");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in to work on estates.");
      const ack: FlagAck = { flag, reason: reason.trim(), by: auth.user.id, at: new Date().toISOString() };
      const acks = [...item.acks, ack];
      const { error } = item.instance
        ? await db.from("estate_form_instances").update({ validation_messages: acks }).eq("id", item.instance.id)
        : await db.from("estate_form_instances").insert({
            estate_id: estateId,
            user_id: auth.user.id,
            form_number: item.number,
            title: item.title,
            status: "draft",
            validation_state: "flagged",
            parameters: {},
            validation_messages: acks,
          });
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "estate.form.flag_acknowledged", after: { form: item.number, ...ack } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_form_instances", estateId] });
      toast({ title: "Flag acknowledged", description: "Your reason was saved to the audit trail." });
    },
    onError: (e: Error) => toast({ title: "Could not acknowledge", description: e.message, variant: "destructive" }),
  });
};

/** Logs a reminder request; no outbound messaging is connected yet. */
export const useRemindForForm = (estateId?: string) =>
  useMutation({
    mutationFn: async (item: FormCatalogueItem) => {
      if (!estateId) throw new Error("No estate selected.");
      await logEstateEvent({ estateId, eventType: "estate.form.reminder_requested", after: { form: item.number, waiting_on: item.waitsOn } });
    },
    onSuccess: () => toast({ title: "Reminder logged", description: "Automatic sending to the debtor or creditor isn't connected yet." }),
    onError: (e: Error) => toast({ title: "Reminder failed", description: e.message, variant: "destructive" }),
  });

export interface FiledDocumentRow { id: string; title: string; created_at: string; metadata: Record<string, any> | null }

export const useEstateFiledDocuments = (estateId?: string) =>
  useQuery({
    queryKey: ["estate-filed-documents", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<FiledDocumentRow[]> => {
      const { data, error } = await db
        .from("documents")
        .select("id,title,created_at,metadata")
        .eq("metadata->>estate_id", estateId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as FiledDocumentRow[];
    },
  });

/** Confirms filing only with evidence the OSB received it (acknowledgement / reference number). */
export const useRecordOsbFiling = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ item, reference, receivedAt }: { item: FormCatalogueItem; reference: string; receivedAt: string }) => {
      if (!estateId || !item.instance) throw new Error("Sign the form before recording its filing.");
      if (!item.instance.signing_date) throw new Error("The form must be signed first.");
      if (reference.trim().length < 3) throw new Error("Enter the OSB acknowledgement or reference number.");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(receivedAt)) throw new Error("Enter the date the OSB acknowledged receipt.");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in to work on estates.");
      const osb_evidence = { reference: reference.trim(), received_at: receivedAt, recorded_by: auth.user.id, recorded_at: new Date().toISOString() };
      const { error } = await db
        .from("estate_form_instances")
        .update({ status: "filed", filed_at: new Date(`${receivedAt}T12:00:00Z`).toISOString(), parameters: { ...(item.instance.parameters ?? {}), osb_evidence } })
        .eq("id", item.instance.id);
      if (error) throw error;
      if (item.instance.document_id) {
        await db.from("documents").update({ metadata: { estate_id: estateId, role: "filed", form_number: item.number, form_instance_id: item.instance.id, version: item.evaluation.version.label, osb_status: "acknowledged", osb_reference: osb_evidence.reference } }).eq("id", item.instance.document_id);
      }
      await logEstateEvent({ estateId, eventType: "estate.form.filed", after: { form: item.number, ...osb_evidence } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_form_instances", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-filed-documents", estateId] });
      toast({ title: "Filing confirmed", description: "OSB evidence saved to the audit trail." });
    },
    onError: (e: Error) => toast({ title: "Could not record filing", description: e.message, variant: "destructive" }),
  });
};

/** Saves values the trustee typed to fill a form's missing estate data; audit-logged. */
export const useFillFormData = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ patch, formNumber }: { patch: Record<string, string | null>; formNumber: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
      if (!Object.keys(clean).length) throw new Error("Nothing to save.");
      const { data: before } = await db.from("estates").select("*").eq("id", estateId).maybeSingle();
      const { data, error } = await db.from("estates").update(clean).eq("id", estateId).select().single();
      if (error) throw error;
      await logEstateEvent({ estateId, eventType: "form.data_filled", before, after: { form: formNumber, ...clean } });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate-row", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-rows"] });
      toast({ title: "Form details saved", description: "Saved to the estate record and the audit trail." });
    },
    onError: (e: Error) => toast({ title: "Could not save details", description: e.message, variant: "destructive" }),
  });
};

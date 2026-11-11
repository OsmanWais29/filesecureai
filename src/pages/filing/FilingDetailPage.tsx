import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import JSZip from "jszip";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";
import { schemaFor, useCreateFiling, useOsbFiling, useOsbFilings, useOsbSchemas, useRecordOsbResponse, useSaveChecks, useSignFiling, type OsbFiling } from "@/hooks/useOsbFilings";
import { crossFormCheck, packageCheck, readiness, rulesCheck, schemaCheck, type Readiness } from "@/lib/filing/checks";
import { diffPayload } from "@/lib/filing/diff";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/filing/types";
import { statusVariant } from "./FilingCentrePage";

const sumCreditors = (f?: OsbFiling | null) => Array.isArray(f?.payload?.Creditor) ? (f!.payload.Creditor as any[]).reduce((s, c) => s + Number(c.Amount ?? 0), 0) : null;
const STATE_LABEL = { pass: "Passed", fail: "Issues", not_checked: "Not checked" } as const;

const FilingDetailPage = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const { data, isLoading } = useOsbFiling(id);
  const filing = data?.filing ?? null;
  const { data: siblings = [] } = useOsbFilings(filing?.estate_id);
  const { data: schemas } = useOsbSchemas();
  const { rules } = useEstateCompliance(filing?.estate_id);
  const saveChecks = useSaveChecks();
  const sign = useSignFiling();
  const record = useRecordOsbResponse();
  const amend = useCreateFiling();
  const [showXml, setShowXml] = useState(false);
  const [resp, setResp] = useState({ outcome: "accepted" as "acknowledged" | "accepted" | "rejected", reference: "", receivedOn: "", message: "", lateReason: "" });

  const schema = filing ? schemaFor(schemas, filing.form_number, filing.version_label) : null;
  const amended = siblings.find((s) => s.id === filing?.amends_filing_id) ?? null;

  const computed: Readiness | null = useMemo(() => {
    if (!filing || !schema) return null;
    const prior79 = siblings.find((s) => s.form_number === "Form 79" && s.id !== filing.id && s.signed_at);
    const current = sumCreditors(filing);
    const failing = rules.filter((r) => r.state !== "pass").map((r) => r.rule);
    const ready = siblings.filter((s) => s.signed_at && s.id !== filing.id).map((s) => s.form_number);
    return readiness([
      schemaCheck(schema.elements, filing.payload),
      crossFormCheck(prior79 && filing.form_number !== "Form 79" ? { form79LiabilitiesTotal: sumCreditors(prior79), creditorRegisterTotal: current } : {}),
      rulesCheck(failing, rules.length > 0),
      packageCheck(filing.form_number, filing.estates?.estate_type, ready),
    ]);
  }, [filing, schema, siblings, rules]);

  if (isLoading) return <MainLayout><p className="p-6 text-sm text-muted-foreground">Loading…</p></MainLayout>;
  if (!filing) return <MainLayout><p className="p-6 text-sm">Filing not found or you don't have access.</p></MainLayout>;

  const layers = (filing.readiness?.layers ?? computed?.layers ?? []) as Readiness["layers"];
  const saved = filing.readiness?.state;
  const canRecord = ["signed", "queued", "submitted", "acknowledged"].includes(filing.status);
  const changes = amended ? diffPayload(amended.payload, filing.payload) : [];

  const exportEstate = async () => {
    const zip = new JSZip();
    const { data: packs } = await (supabase as any).from("osb_evidence_packs").select("*").eq("estate_id", filing.estate_id);
    for (const s of siblings) {
      const dir = zip.folder(`${s.form_number.replace(/\s/g, "")}_${s.id.slice(0, 8)}`)!;
      dir.file("filing.json", JSON.stringify(s, null, 2));
      if (s.xml) dir.file("filing.xml", s.xml);
      const p = (packs ?? []).find((x: any) => x.filing_id === s.id);
      if (p) dir.file("evidence-pack.json", JSON.stringify(p, null, 2));
    }
    const url = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
    const a = document.createElement("a"); a.href = url; a.download = `osb-filings-${filing.estates?.file_number ?? filing.estate_id}.zip`; a.click();
  };

  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl space-y-5 py-6">
        <Link to="/filing" className="text-sm text-muted-foreground hover:underline">← Filing Centre</Link>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{filing.form_number} · {filing.estates?.debtor_name}</h1>
            <p className="text-sm text-muted-foreground">{filing.version_label}{filing.deadline ? ` · Due ${filing.deadline}` : ""}{amended ? " · Amendment" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant(filing.status)}>{STATUS_LABEL[filing.status]}</Badge>
            <Button variant="outline" size="sm" asChild><Link to={`/estates/${filing.estate_id}?m=documents&p=forms`}>Open estate</Link></Button>
            <Button variant="outline" size="sm" onClick={exportEstate}>Office-visit export</Button>
          </div>
        </header>

        <ol className="flex flex-wrap gap-1 text-xs">
          {[...STATUS_FLOW, ...(filing.status === "rejected" ? (["rejected"] as const) : [])].map((s) => {
            const ev = data!.events.find((e) => e.to_status === s);
            return <li key={s} className={`rounded-full border px-2 py-1 ${ev ? "bg-muted font-medium" : "text-muted-foreground"}`}>{STATUS_LABEL[s]}{ev ? ` · ${ev.at.slice(0, 10)}` : ""}</li>;
          })}
        </ol>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Ready to file?</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {computed && <p><span className="font-medium">{computed.state === "ready" ? "Ready" : computed.state === "blocked" ? `${computed.issues.length} issue(s) to fix` : "Some checks couldn't run"}</span> · {computed.score}% of check layers passed{saved && saved !== computed.state ? " (saved result is out of date — run checks again)" : ""}</p>}
            {(computed?.layers ?? layers).map((l) => (
              <div key={l.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between"><span className="font-medium">{l.label}</span><Badge variant={l.state === "pass" ? "secondary" : l.state === "fail" ? "destructive" : "outline"}>{STATE_LABEL[l.state]}</Badge></div>
                {l.note && <p className="mt-1 text-xs text-muted-foreground">{l.note}</p>}
                {l.issues.map((i, n) => <p key={n} className="mt-1 text-xs">• {i.message} {i.fix && <Link className="underline" to={`/estates/${filing.estate_id}?m=${i.fix === "creditors" ? "creditors" : i.fix === "compliance" ? "compliance" : "documents&p=forms"}`}>Fix</Link>}</p>)}
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {["drafted", "checked"].includes(filing.status) && computed && (
                <Button size="sm" variant="outline" disabled={saveChecks.isPending} onClick={() => saveChecks.mutate({ filing, readiness: computed, elements: schema!.elements, namespace: schema!.version?.namespace ?? null })}>Run checks</Button>
              )}
              {filing.status === "checked" && <Button size="sm" disabled={sign.isPending || (filing.readiness?.issues?.length ?? 0) > 0} onClick={() => sign.mutate({ filing })}>Sign and seal</Button>}
              {filing.status === "signed" && <Button size="sm" disabled title="Needs a loaded OSB schema and OSB vendor access">Queue for OSB submission (not connected)</Button>}
              {["accepted", "rejected"].includes(filing.status) && (
                <Button size="sm" variant="outline" disabled={amend.isPending} onClick={() => amend.mutate({ estateId: filing.estate_id, formNumber: filing.form_number, versionLabel: filing.version_label, deadline: filing.deadline, amendsId: filing.id }, { onSuccess: (f) => nav(`/filing/${f.id}`) })}>Create amendment</Button>
              )}
            </div>
            {filing.status === "checked" && (filing.readiness?.layers ?? []).some((l: any) => l.state === "not_checked") && <p className="text-xs text-muted-foreground">You can sign with checks that couldn't run, but the evidence pack records them as "Not checked".</p>}
          </CardContent>
        </Card>

        {canRecord && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Record the OSB response</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <select className="h-9 rounded-md border bg-background px-2" value={resp.outcome} onChange={(e) => setResp({ ...resp, outcome: e.target.value as any })}>
                <option value="acknowledged">Acknowledged (received)</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option>
              </select>
              <Input placeholder="OSB reference number" value={resp.reference} onChange={(e) => setResp({ ...resp, reference: e.target.value })} />
              <Input type="date" value={resp.receivedOn} onChange={(e) => setResp({ ...resp, receivedOn: e.target.value })} />
              <Input placeholder={resp.outcome === "rejected" ? "OSB rejection reason" : "Note (optional)"} value={resp.message} onChange={(e) => setResp({ ...resp, message: e.target.value })} />
              {resp.outcome === "accepted" && filing.deadline && resp.receivedOn > filing.deadline && <Textarea className="sm:col-span-2" placeholder="Filed after the deadline — reason (saved to the record)" value={resp.lateReason} onChange={(e) => setResp({ ...resp, lateReason: e.target.value })} />}
              <Button size="sm" className="sm:col-span-2 sm:w-fit" disabled={record.isPending || resp.reference.trim().length < 3 || !resp.receivedOn || (resp.outcome === "rejected" && !resp.message.trim())} onClick={() => record.mutate({ filing, ...resp })}>Save response</Button>
            </CardContent>
          </Card>
        )}

        {filing.status === "rejected" && filing.osb_response?.message && <Card><CardContent className="p-4 text-sm"><p className="font-medium">OSB rejection</p><p>{filing.osb_response.message}</p><p className="mt-1 text-xs text-muted-foreground">Create an amendment to fix and refile.</p></CardContent></Card>}
        {filing.deadline_outcome && <p className="text-sm">Deadline {filing.deadline_outcome === "met" ? "met" : `missed — ${filing.late_reason}`}.</p>}

        {amended && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Changes from the filed version</CardTitle></CardHeader>
            <CardContent className="text-sm">
              {changes.length ? <table className="w-full text-left text-xs"><thead><tr className="text-muted-foreground"><th>Field</th><th>Filed</th><th>Amended</th></tr></thead><tbody>{changes.map((c) => <tr key={c.field} className="border-t"><td className="py-1">{c.field}</td><td>{c.before}</td><td className="font-medium">{c.after}</td></tr>)}</tbody></table> : <p className="text-muted-foreground">No differences yet. Update the estate record, then run checks again.</p>}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Evidence pack</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {data!.pack ? (<>
              <p>Sealed {data!.pack.sealed_at.slice(0, 16).replace("T", " ")} · fingerprint <code className="break-all text-xs">{data!.pack.pack_sha256}</code></p>
              <p className="text-xs text-muted-foreground">Includes the estate values, check results, signer, timestamps and history{filing.xml ? ", plus the XML" : ""}. Saved to Documents; it can't be edited.</p>
            </>) : <p className="text-muted-foreground">Sealed automatically when the filing is signed.</p>}
            <Collapsible open={showXml} onOpenChange={setShowXml}>
              <CollapsibleTrigger className="text-xs underline">{showXml ? "Hide" : "Show"} XML</CollapsibleTrigger>
              <CollapsibleContent>{filing.xml ? <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs">{filing.xml}</pre> : <p className="mt-2 text-xs text-muted-foreground">No XML yet: the OSB schema for {filing.form_number} ({filing.version_label}) isn't loaded in the Mapping Studio.</p>}</CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">History</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs">{data!.events.map((e) => <p key={e.id}>{e.at.slice(0, 16).replace("T", " ")} · {STATUS_LABEL[e.to_status as keyof typeof STATUS_LABEL] ?? e.to_status} · {e.detail}</p>)}</CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
export default FilingDetailPage;

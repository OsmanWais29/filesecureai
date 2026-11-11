import { useMemo, useState } from "react";
import { FormDetailsEditor, buildFormPdf, missingFields } from "@/components/estate/forms/FormDetails";
import { useEstateRow } from "@/hooks/useEstateRecords";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Register } from "@/components/estate/forms/RecordForm";
import {
  FormCatalogueItem,
  formToValues,
  useAcknowledgeFlag,
  useEstateFiledDocuments,
  useEstateForms,
  useFillFormData,
  useRecordOsbFiling,
  useRemindForForm,
  useSaveFormInstance,
} from "@/hooks/useEstateForms";
import { FormStatus, signRefusal, sortDue } from "@/lib/forms/formEngine";
import { ChevronDown } from "lucide-react";

const pillVariant = (s?: FormStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "Ready" || s === "Signed") return "default";
  if (s === "Filed") return "secondary";
  if (s === "Flagged" || s === "Missing data") return "destructive";
  return "outline";
};

const FormRow = ({ item, onOpen, onAction, busy }: { item: FormCatalogueItem; onOpen: () => void; onAction: () => void; busy: boolean }) => {
  const e = item.evaluation;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm hover:bg-muted/40">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{item.number}</span>
          <span>{item.title}</span>
          {e.period && <span className="text-muted-foreground">· {e.period}</span>}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {e.version.label} — {e.version.reason}
          {e.deadline && ` · Due ${e.deadline} (${item.deadline?.citation})`}
        </p>
        {e.detail && <p className="mt-1 text-xs">{e.detail}</p>}
      </button>
      {e.status && <Badge variant={pillVariant(e.status)}>{e.status}</Badge>}
      {e.action && (
        <Button size="sm" variant={e.action === "Sign" || e.action === "Record OSB filing" ? "default" : "outline"} onClick={onAction} disabled={busy}>
          {e.action}
        </Button>
      )}
    </div>
  );
};

const Group = ({ title, hint, children, empty }: { title: string; hint: string; children: React.ReactNode; empty: boolean }) => (
  <section className="space-y-2">
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
    {empty ? <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">Nothing here.</p> : children}
  </section>
);

export const FormsTab = ({ estateId }: { estateId?: string }) => {
  const [activeNo, setActiveNo] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const { items, isLoading } = useEstateForms(estateId);
  const { data: filedDocs = [] } = useEstateFiledDocuments(estateId);
  const save = useSaveFormInstance(estateId);
  const ack = useAcknowledgeFlag(estateId);
  const remind = useRemindForForm(estateId);
  const recordFiling = useRecordOsbFiling(estateId);
  const [osbRef, setOsbRef] = useState("");
  const [osbDate, setOsbDate] = useState("");
  const { data: estate } = useEstateRow(estateId);
  const fill = useFillFormData(estateId);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const active = items.find((i) => i.number === activeNo) ?? null;

  const groups = useMemo(() => {
    const rows = items.map((i) => ({ ...i }));
    return {
      due: sortDue(rows.filter((r) => r.evaluation.bucket === "due")),
      waiting: rows.filter((r) => r.evaluation.bucket === "waiting"),
      filed: rows
        .filter((r) => r.evaluation.bucket === "filed")
        .sort((a, b) => (b.instance?.filed_at ?? "").localeCompare(a.instance?.filed_at ?? "")),
      na: rows.filter((r) => r.evaluation.bucket === "na"),
    };
  }, [items]);

  const runAction = (item: FormCatalogueItem) => {
    const a = item.evaluation.action;
    if (a === "Generate") save.mutate({ item, values: formToValues(item), generate: true });
    else if (a === "Record OSB filing") setActiveNo(item.number);
    else if (a === "Sign") {
      const refusal = signRefusal(item.evaluation);
      if (refusal || missingFields(item.number, estate as Record<string, any> | null).length) setActiveNo(item.number);
      else save.mutate({ item, values: { ...formToValues(item), signingDate: new Date().toISOString().slice(0, 10) }, generate: true, file: true });
    } else if (a === "Remind") remind.mutate(item);
    else setActiveNo(item.number);
  };

  const row = (i: FormCatalogueItem) => (
    <FormRow key={i.number} item={i} busy={save.isPending || !estateId} onOpen={() => setActiveNo(i.number)} onAction={() => runAction(i)} />
  );
  const docFor = (i: FormCatalogueItem) => filedDocs.find((d) => d.id === i.instance?.document_id);

  return (
    <Register title="Forms" description="Grouped by what needs doing. Deadlines cite the BIA. A form only counts as filed once OSB evidence is recorded.">
      {isLoading && <p className="text-sm text-muted-foreground">Loading forms…</p>}
      <div className="space-y-6">
        <Group title="Due now" hint="Needed at this stage, nearest deadline first." empty={!groups.due.length}>
          <div className="space-y-2">{groups.due.map(row)}</div>
        </Group>
        <Group title="Waiting on others" hint="Held up by the debtor or by creditors." empty={!groups.waiting.length}>
          <div className="space-y-2">{groups.waiting.map(row)}</div>
        </Group>
        <Group title="Filed" hint="Only forms with recorded OSB evidence. Signed forms stay in Due now until then." empty={!groups.filed.length}>
          <div className="space-y-2">
            {groups.filed.map((i) => (
              <div key={i.number} className="space-y-1">
                {row(i)}
                <p className="pl-3 text-xs text-muted-foreground">
                  OSB acknowledged {i.instance?.filed_at?.slice(0, 10)} · {docFor(i) ? `Saved to Documents as "${docFor(i)!.title}"` : "Copy not linked"}
                </p>
              </div>
            ))}
          </div>
        </Group>
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm font-semibold">
            <ChevronDown className="h-4 w-4" /> Not applicable ({groups.na.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-1">
            {groups.na.map((i) => (
              <p key={i.number} className="rounded-md border p-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{i.number}</span> {i.title} — {i.evaluation.naReason}
              </p>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Sheet open={Boolean(active)} onOpenChange={(o) => { if (!o) { setActiveNo(null); setReason(""); setPdfUrl(null); } }}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
          {active && (() => {
            const e = active.evaluation;
            const refusal = signRefusal(e);
            return (
              <>
                <SheetHeader>
                  <SheetTitle>{active.number} — {active.title}</SheetTitle>
                  <SheetDescription>{e.period ? `Covers ${e.period}. ` : ""}{e.status ?? "Not applicable"}</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-5 text-sm">
                  <FormDetailsEditor item={active} estate={estate as Record<string, any> | null} saving={fill.isPending} onSave={(patch) => fill.mutate({ patch, formNumber: active.number }, { onSuccess: () => setPdfUrl(null) })} />
                  <section className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold">PDF preview</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPdfUrl(buildFormPdf(active, estate as Record<string, any> | null))}>{pdfUrl ? "Refresh preview" : "Show preview"}</Button>
                        {pdfUrl && <Button variant="ghost" size="sm" onClick={() => window.open(pdfUrl, "_blank")}>Open in new tab</Button>}
                      </div>
                    </div>
                    {pdfUrl ? <iframe title={`${active.number} preview`} src={pdfUrl} className="h-[520px] w-full rounded-md border" /> : <p className="text-xs text-muted-foreground">Shows the form filled with this estate's details. Missing values appear in red.</p>}
                  </section>
                  <section>
                    <h4 className="font-semibold">Form version</h4>
                    <p>{e.version.label}</p>
                    <p className="text-xs text-muted-foreground">{e.version.reason} Chosen automatically from the filing date.</p>
                  </section>
                  <section>
                    <h4 className="font-semibold">Where the data comes from</h4>
                    <ul className="mt-1 space-y-1">
                      {active.sources.map((s) => {
                        const unverified = e.flags.some((f) => f.id === `unverified:${s}`);
                        return (
                          <li key={s} className="flex items-center gap-2">
                            {s} {unverified ? <Badge variant="destructive">Unverified</Badge> : <Badge variant="secondary">Entered by staff</Badge>}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                  <section className="space-y-2">
                    <h4 className="font-semibold">Checks</h4>
                    {e.blockers.map((b) => (
                      <p key={b} className="rounded-md border p-2">Not met: {b} <span className="text-xs text-muted-foreground">— why: estate compliance rule.</span></p>
                    ))}
                    {e.flags.map((f) => {
                      const done = active.acks.find((a) => a.flag === f.id);
                      return (
                        <div key={f.id} className="rounded-md border p-2">
                          <p>{f.message}</p>
                          <p className="text-xs text-muted-foreground">Why: {f.why}</p>
                          {done ? (
                            <p className="mt-1 text-xs">Acknowledged: “{done.reason}” ({done.at.slice(0, 10)})</p>
                          ) : (
                            <div className="mt-2 space-y-2">
                              <Textarea placeholder="Why this is acceptable (saved to the audit trail)" value={reason} onChange={(ev) => setReason(ev.target.value)} />
                              <Button size="sm" variant="outline" disabled={ack.isPending || reason.trim().length < 5} onClick={() => ack.mutate({ item: active, flag: f.id, reason }, { onSuccess: () => setReason("") })}>
                                Resolve flag
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {!e.blockers.length && !e.flags.length && e.version.known && <p className="text-muted-foreground">No flags.</p>}
                    <p className="text-xs text-muted-foreground">OSB XML format check: Not available yet.</p>
                  </section>
                  {e.status === "Signed" && (
                    <section className="space-y-2 rounded-md border p-3">
                      <h4 className="font-semibold">Record OSB filing</h4>
                      <p className="text-xs text-muted-foreground">Signed internally. It is not shown as filed until you enter the OSB acknowledgement (e.g. the e-filing reference) and the date received.</p>
                      <input className="w-full rounded-md border bg-background px-2 py-1 text-sm" placeholder="OSB acknowledgement / reference number" value={osbRef} onChange={(ev) => setOsbRef(ev.target.value)} />
                      <input type="date" className="w-full rounded-md border bg-background px-2 py-1 text-sm" value={osbDate} onChange={(ev) => setOsbDate(ev.target.value)} />
                      <Button size="sm" disabled={recordFiling.isPending || osbRef.trim().length < 3 || !osbDate} onClick={() => recordFiling.mutate({ item: active, reference: osbRef, receivedAt: osbDate }, { onSuccess: () => { setOsbRef(""); setOsbDate(""); } })}>
                        Confirm filed
                      </Button>
                    </section>
                  )}
                  {e.bucket === "filed" && (
                    <section>
                      <h4 className="font-semibold">OSB evidence</h4>
                      <p>{e.detail}</p>
                    </section>
                  )}
                  <div className="flex flex-wrap gap-2 border-t pt-4">
                    {e.action !== "Record OSB filing" && e.bucket !== "filed" && e.bucket !== "na" && (
                      <Button
                        size="sm"
                        disabled={save.isPending || missingFields(active.number, estate as Record<string, any> | null).length > 0}
                        onClick={() => {
                          if (refusal || missingFields(active.number, estate as Record<string, any> | null).length) return;
                          save.mutate({ item: active, values: { ...formToValues(active), signingDate: new Date().toISOString().slice(0, 10) }, generate: true, file: true });
                        }}
                      >
                        Sign
                      </Button>
                    )}
                  </div>
                  {refusal && e.status !== "Signed" && e.bucket !== "filed" && e.bucket !== "na" && <p className="text-xs text-destructive">{refusal}</p>}
                  {missingFields(active.number, estate as Record<string, any> | null).length > 0 && e.bucket !== "filed" && <p className="text-xs text-destructive">Fill in the missing form details above before signing.</p>}
                  <p className="text-xs text-muted-foreground">Signing saves the signed copy to Documents. Submission to the OSB happens outside SecureFiles for now; record its acknowledgement here.</p>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </Register>
  );
};

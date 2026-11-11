import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildPlan, form65Gaps, type PlanEstate, type PlanItem } from "@/lib/filing/plan";
import { useCreateFiling, useSignFiling } from "@/hooks/useOsbFilings";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOsbFilings, useOsbSchemas, type OsbFiling } from "@/hooks/useOsbFilings";
import { STATUS_LABEL, type FilingStatus } from "@/lib/filing/types";
import { actionBucket, byRisk, isDueSoon, isOverdue } from "@/lib/filing/queue";
import { cn } from "@/lib/utils";

export const statusVariant = (s: FilingStatus): "default" | "secondary" | "destructive" | "outline" =>
  s === "accepted" ? "default" : s === "rejected" ? "destructive" : s === "signed" || s === "checked" ? "secondary" : "outline";

type CountKey = "sign" | "fix" | "debtor" | "soon" | "overdue";
const today = () => new Date().toISOString().slice(0, 10);

const actionLabel = (f: OsbFiling) => {
  const b = actionBucket(f);
  return b === "sign" ? "Sign" : b === "fix" ? "Fix" : b === "osb" ? "Record OSB reference" : "View";
};

const Row = ({ f, t }: { f: OsbFiling; t: string }) => {
  const issue = f.readiness?.issues?.[0]?.message;
  const blocker = f.status === "rejected" ? "Rejected by OSB" : issue ?? (actionBucket(f) === "sign" ? "Checks passed, ready to sign" : actionBucket(f) === "osb" ? "Signed, waiting to be filed with the OSB" : "Checks not run yet");
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{f.estates?.debtor_name ?? "Estate"}{f.estates?.file_number ? ` · ${f.estates.file_number}` : ""} — Form {f.form_number}
          {f.amends_filing_id && <Badge variant="outline" className="ml-2">Amended</Badge>}</p>
        <p className="text-xs text-muted-foreground">{f.version_label}{f.deadline ? ` · Due ${f.deadline}` : " · No deadline recorded"}{isOverdue(f, t) && <span className="ml-1 font-medium text-destructive">· Overdue</span>}</p>
        <p className={cn("mt-1 text-xs", issue || f.status === "rejected" ? "text-destructive" : "text-muted-foreground")}>{blocker}</p>
      </div>
      <Badge variant={statusVariant(f.status)}>{STATUS_LABEL[f.status]}</Badge>
      <Button asChild size="sm" variant={actionBucket(f) === "sign" ? "default" : "outline"}><Link to={`/filing/${f.id}`}>{actionLabel(f)}</Link></Button>
    </div>
  );
};


const db = supabase as unknown as { from: (t: string) => any };
const useEstateList = () => useQuery({
  queryKey: ["filing_estates"],
  queryFn: async (): Promise<PlanEstate[]> => {
    const { data, error } = await db.from("estates").select("id, debtor_name, file_number, estate_type, insolvency_date, appointment_date, administration_type").order("debtor_name");
    if (error) throw error;
    return data ?? [];
  },
});

const download = async (zip: JSZip, name: string) => {
  const url = URL.createObjectURL(await zip.generateAsync({ type: "blob" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
};

/** Signed filings ready to file manually: XML, payload and sealed evidence, numbered in filing order. */
export const exportPackage = async (filings: OsbFiling[], name: string) => {
  const zip = new JSZip();
  const ids = filings.map((f) => f.id);
  const { data: packs } = ids.length ? await db.from("osb_evidence_packs").select("*").in("filing_id", ids) : { data: [] };
  filings.slice().sort((a, b) => (a.deadline ?? "9").localeCompare(b.deadline ?? "9")).forEach((f, i) => {
    const dir = zip.folder(`${String(i + 1).padStart(2, "0")}_${(f.estates?.file_number ?? f.estate_id.slice(0, 8))}_${f.form_number.replace(/\s/g, "")}`)!;
    dir.file("filing.json", JSON.stringify(f.payload, null, 2));
    dir.file(f.xml ? "filing.xml" : "XML-NOT-GENERATED.txt", f.xml ?? "No OSB schema is loaded for this form, so XML was not generated. File using the signed PDF.");
    const p = (packs ?? []).find((x: any) => x.filing_id === f.id);
    if (p) dir.file("evidence-pack.json", JSON.stringify(p, null, 2));
  });
  await download(zip, name);
};

/** Office-visit bundle: every filing in scope, timing against deadline, checks, signer, OSB response and history. */
const exportOfficeVisit = async (filings: OsbFiling[]) => {
  const zip = new JSZip();
  const ids = filings.map((f) => f.id);
  const [{ data: events }, { data: packs }] = ids.length
    ? await Promise.all([db.from("osb_filing_events").select("*").in("filing_id", ids).order("at"), db.from("osb_evidence_packs").select("filing_id, pack_sha256, created_at").in("filing_id", ids)])
    : [{ data: [] }, { data: [] }];
  const head = "estate,file_number,form,version,status,deadline,deadline_outcome,signed_at,signed_by,osb_reference,responded_at,checks,evidence_pack_sha256";
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = filings.map((f) => [f.estates?.debtor_name, f.estates?.file_number, f.form_number, f.version_label, f.status, f.deadline, f.deadline_outcome, f.signed_at, f.signed_by, f.osb_reference, f.responded_at, f.readiness?.state ?? "not run", (packs ?? []).find((p: any) => p.filing_id === f.id)?.pack_sha256].map(esc).join(","));
  zip.file("filings.csv", [head, ...rows].join("\n"));
  zip.file("history.json", JSON.stringify(events ?? [], null, 2));
  zip.file("README.txt", `Prepared ${new Date().toISOString()} by SecureFiles AI for an OSB office visit. ${filings.length} filings. Statuses after "Signed" were recorded from OSB references entered by staff.`);
  await download(zip, `osb-office-visit-${new Date().toISOString().slice(0, 10)}.zip`);
};

const PlanRow = ({ p, onDraft, busy }: { p: PlanItem; onDraft: () => void; busy: boolean }) => (
  <div className="flex flex-wrap items-center gap-3 rounded-md border border-dashed p-3 text-sm">
    <div className="min-w-0 flex-1">
      <p className="font-medium">{p.estate.debtor_name}{p.estate.file_number ? ` · ${p.estate.file_number}` : ""} — {p.def.number}</p>
      <p className="text-xs text-muted-foreground">{p.reason}{p.deadline ? ` · Due ${p.deadline}` : ""}</p>
      <p className={cn("mt-1 text-xs", p.blocker ? "text-destructive" : "text-muted-foreground")}>{p.blocker ?? "Can be drafted from estate records"}</p>
    </div>
    <Badge variant="outline">Not started</Badge>
    <Button size="sm" variant="outline" disabled={busy} onClick={onDraft}>Draft</Button>
  </div>
);

const Calendar = ({ items, t }: { items: { date: string; label: string; overdue: boolean }[]; t: string }) => {
  const [offset, setOffset] = useState(0);
  const base = new Date(`${t.slice(0, 7)}-01T00:00:00Z`); base.setUTCMonth(base.getUTCMonth() + offset);
  const ym = base.toISOString().slice(0, 7);
  const first = base.getUTCDay();
  const days = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setOffset(offset - 1)}>‹</Button>
        <p className="text-sm font-medium">{base.toLocaleString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
        <Button size="sm" variant="outline" onClick={() => setOffset(offset + 1)}>›</Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <p key={d} className="p-1 text-muted-foreground">{d}</p>)}
        {cells.map((d, i) => {
          const date = d ? `${ym}-${String(d).padStart(2, "0")}` : "";
          const due = d ? items.filter((x) => x.date === date) : [];
          return (
            <div key={i} className={cn("min-h-20 rounded border p-1", !d && "border-transparent", date === t && "border-primary")}>
              {d && <p className="text-muted-foreground">{d}</p>}
              {due.slice(0, 3).map((x, j) => <p key={j} className={cn("truncate", x.overdue && "text-destructive")}>{x.label}</p>)}
              {due.length > 3 && <p className="text-muted-foreground">+{due.length - 3} more</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FilingCentrePage = () => {
  const { data = [], isLoading, error } = useOsbFilings();
  const { data: schemaData } = useOsbSchemas();
  const schemas = schemaData?.versions ?? [];
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [count, setCount] = useState<CountKey | null>(null);
  const t = today();

  const types = useMemo(() => Array.from(new Set(data.map((f) => f.estates?.estate_type).filter(Boolean))) as string[], [data]);
  const scoped = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter((f) => (type === "all" || f.estates?.estate_type === type) &&
      (!s || (f.estates?.debtor_name ?? "").toLowerCase().includes(s) || (f.estates?.file_number ?? "").toLowerCase().includes(s)));
  }, [data, q, type]);
  const estatesInScope = new Set(scoped.map((f) => f.estate_id));
  const oneEstate = q.trim() && estatesInScope.size === 1 ? scoped[0].estates : null;

  const counts: Record<CountKey, OsbFiling[]> = {
    sign: scoped.filter((f) => actionBucket(f) === "sign"),
    fix: scoped.filter((f) => actionBucket(f) === "fix"),
    debtor: [],
    soon: scoped.filter((f) => isDueSoon(f, t)),
    overdue: scoped.filter((f) => isOverdue(f, t)),
  };
  const open = scoped.filter((f) => actionBucket(f) !== "filed");
  const filed = scoped.filter((f) => actionBucket(f) === "filed");
  const rows = (count ? counts[count] : scoped).slice().sort(byRisk(t));
  const { data: estates = [] } = useEstateList();
  const create = useCreateFiling();
  const sign = useSignFiling();
  const [tab, setTab] = useState("plan");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const matchEstate = (e: PlanEstate) => {
    const s = q.trim().toLowerCase();
    return (type === "all" || e.estate_type === type) && (!s || e.debtor_name.toLowerCase().includes(s) || (e.file_number ?? "").toLowerCase().includes(s));
  };
  const scopedEstates = estates.filter(matchEstate);
  const plan = buildPlan(scopedEstates, data, t).sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
  const gaps = form65Gaps(scopedEstates, data, t);
  const signQueue = scoped.filter((f) => actionBucket(f) === "sign");
  const thisMonth65 = scoped.filter((f) => f.form_number === "Form 65" && f.created_at.slice(0, 7) === t.slice(0, 7));
  const batch65 = plan.filter((p) => p.def.number === "Form 65");
  const rejected = scoped.filter((f) => f.status === "rejected");
  const readyToExport = scoped.filter((f) => f.status === "signed");
  const calendarItems = [
    ...open.filter((f) => f.deadline).map((f) => ({ date: f.deadline!, label: `${f.form_number} · ${f.estates?.debtor_name ?? ""}`, overdue: isOverdue(f, t) })),
    ...plan.filter((p) => p.deadline).map((p) => ({ date: p.deadline!, label: `${p.def.number} · ${p.estate.debtor_name}`, overdue: p.deadline! < t })),
  ];
  const draft = (p: PlanItem) => create.mutateAsync({ estateId: p.estate.id, formNumber: p.def.number, versionLabel: p.versionLabel, deadline: p.deadline });
  const runBatch = async () => { setBusy(true); try { for (const p of batch65) await draft(p); } finally { setBusy(false); } };
  const signPicked = async () => {
    setBusy(true);
    try { for (const f of signQueue.filter((x) => picked.includes(x.id))) await sign.mutateAsync({ filing: f }); setPicked([]); } finally { setBusy(false); }
  };
  const missingAnchors = scopedEstates.filter((e) => !e.insolvency_date).length;

  const latestSchema = schemas.map((s) => s.loaded_at).sort().pop();
  const cards: { k: CountKey; label: string; who: string }[] = [
    { k: "sign", label: "Ready to sign", who: "Trustee acts" },
    { k: "fix", label: "Needs a fix", who: "Staff act" },
    { k: "debtor", label: "Waiting on debtor", who: "Client acts" },
    { k: "soon", label: "Due in 7 days", who: "Urgent" },
    { k: "overdue", label: "Overdue", who: "Past deadline" },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto space-y-5 py-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Filing Centre</h1>
            <p className="text-sm text-muted-foreground">What every estate owes the OSB, and who has to act next.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm" className="h-7 rounded-full text-xs">Manual filing mode</Button></PopoverTrigger>
              <PopoverContent className="w-80 text-sm">SecureFiles isn't connected to OSB e-filing yet. Filings stop at "Signed": file with the OSB as you do today, then record the OSB reference on the filing. Deadlines and checks still work.</PopoverContent>
            </Popover>
            <Button asChild variant="outline" size="sm" className="h-7 rounded-full text-xs">
              <Link to="/filing/studio">{latestSchema ? `Schemas loaded · ${latestSchema.slice(0, 10)}` : "OSB schemas not loaded"}</Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          <Input value={q} onChange={(e) => { setQ(e.target.value); setCount(null); }} placeholder="Load an estate: debtor name or estate number" className="max-w-sm" />
          <Select value={type} onValueChange={(v) => { setType(v); setCount(null); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Estate type" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All estate types</SelectItem>{types.map((x) => <SelectItem key={x} value={x}>{x.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
          {(q || type !== "all") && <Button variant="ghost" onClick={() => { setQ(""); setType("all"); setCount(null); }}>Clear</Button>}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {cards.map(({ k, label, who }) => {
            const n = counts[k].length;
            const notTracked = k === "debtor";
            return (
              <button key={k} type="button" disabled={notTracked} onClick={() => setCount(count === k ? null : k)}
                className={cn("text-left", notTracked && "cursor-not-allowed")} aria-pressed={count === k}>
                <Card className={cn("h-full transition-colors", count === k && "border-primary", k === "overdue" && n > 0 && "border-destructive")}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={cn("text-2xl font-semibold", k === "overdue" && n > 0 && "text-destructive")}>{notTracked ? "—" : n}</p>
                    <p className="text-xs text-muted-foreground">{notTracked ? "Not linked to portal requests yet" : who}</p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {oneEstate && (
          <Card><CardContent className="p-4 text-sm">
            <p className="font-medium">{oneEstate.debtor_name}{oneEstate.file_number ? ` · ${oneEstate.file_number}` : ""}</p>
            <p className="text-xs text-muted-foreground">{scoped.length} filings · {filed.length} accepted · {open.length} outstanding · {counts.overdue.length} overdue — full timeline below, newest deadline risk first.</p>
          </CardContent></Card>
        )}

        {error && <p className="text-sm text-destructive">Could not load filings: {(error as Error).message}</p>}
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          count || oneEstate ? (
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{count ? cards.find((c) => c.k === count)!.label : "Estate filing timeline"} ({rows.length})</h2>
                <div className="flex gap-2">
                  {oneEstate && <Button size="sm" variant="outline" onClick={() => exportOfficeVisit(scoped)}>Prepare for office visit</Button>}
                  {count && <Button variant="link" size="sm" onClick={() => setCount(null)}>Back to filing plan</Button>}
                </div>
              </div>
              {rows.map((f) => <Row key={f.id} f={f} t={t} />)}
              {oneEstate && plan.map((p) => <PlanRow key={p.key} p={p} busy={create.isPending} onDraft={() => draft(p)} />)}
              {!rows.length && !(oneEstate && plan.length) && <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Nothing here.</p>}
            </section>
          ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList>
                <TabsTrigger value="plan">Filing plan ({open.length + plan.length})</TabsTrigger>
                <TabsTrigger value="sign">Sign queue ({signQueue.length})</TabsTrigger>
                <TabsTrigger value="batch">Batch runs</TabsTrigger>
                <TabsTrigger value="rejected">Rejections ({rejected.length})</TabsTrigger>
                <TabsTrigger value="filed">Filed ({filed.length})</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={!readyToExport.length} onClick={() => exportPackage(readyToExport, `osb-filing-package-${t}.zip`)}>Export package ({readyToExport.length})</Button>
                <Button size="sm" variant="outline" disabled={!scoped.length} onClick={() => exportOfficeVisit(scoped)}>Prepare for office visit</Button>
              </div>
            </div>

            <TabsContent value="plan" className="space-y-2">
              {estates.length === 0 || (data.length === 0 && plan.length === 0) ? (
                <Card><CardContent className="space-y-2 p-4 text-sm">
                  <p className="font-medium">Get the Filing Centre working for you</p>
                  <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li className={estates.length ? "line-through" : ""}>Load or import your estates ({estates.length} loaded).</li>
                    <li className={estates.length && !missingAnchors ? "line-through" : ""}>Confirm filing and appointment dates ({missingAnchors} estates missing a filing date).</li>
                    <li>Invite debtors to the client portal from each estate.</li>
                    <li>Run your first monthly Form 65 batch.</li>
                  </ol>
                </CardContent></Card>
              ) : open.length + plan.length === 0 ? (
                <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Everything due is filed or signed. Nothing outstanding across {scopedEstates.length} estates.</p>
              ) : (
                <>
                  {open.slice().sort(byRisk(t)).map((f) => <Row key={f.id} f={f} t={t} />)}
                  {plan.map((p) => <PlanRow key={p.key} p={p} busy={create.isPending} onDraft={() => draft(p)} />)}
                </>
              )}
              {gaps.length > 0 && (
                <Card><CardContent className="p-4 text-sm">
                  <p className="font-medium">Possible gaps to review ({gaps.length})</p>
                  <p className="mb-2 text-xs text-muted-foreground">Months since filing with no Form 65 in SecureFiles. If it was filed in another system, record it on the estate.</p>
                  {gaps.slice(0, 10).map((g) => <p key={`${g.estate.id}${g.month}`} className="text-xs">{g.estate.debtor_name} · Form 65 · {g.month}</p>)}
                  {gaps.length > 10 && <p className="text-xs text-muted-foreground">+{gaps.length - 10} more</p>}
                </CardContent></Card>
              )}
            </TabsContent>

            <TabsContent value="sign" className="space-y-2">
              {signQueue.length ? (
                <>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={picked.length === signQueue.length} onCheckedChange={(v) => setPicked(v ? signQueue.map((f) => f.id) : [])} aria-label="Select all" />
                    <span className="text-sm">{picked.length} selected</span>
                    <Button size="sm" disabled={!picked.length || busy} onClick={signPicked}>{busy ? "Signing…" : `Sign ${picked.length || ""}`}</Button>
                    <span className="text-xs text-muted-foreground">Each filing keeps its own checks and sealed evidence pack.</span>
                  </div>
                  {signQueue.map((f) => (
                    <div key={f.id} className="flex items-center gap-3">
                      <Checkbox checked={picked.includes(f.id)} onCheckedChange={(v) => setPicked(v ? [...picked, f.id] : picked.filter((x) => x !== f.id))} aria-label={`Select ${f.form_number}`} />
                      <div className="flex-1"><Row f={f} t={t} /></div>
                    </div>
                  ))}
                </>
              ) : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">Nothing is ready for your signature.</p>}
            </TabsContent>

            <TabsContent value="batch" className="space-y-3">
              <Card><CardContent className="space-y-3 p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">Form 65 monthly run · {t.slice(0, 7)}</p>
                    <p className="text-xs text-muted-foreground">Every bankruptcy that needs this month's income and expense statement.</p>
                  </div>
                  <Button size="sm" disabled={!batch65.length || busy} onClick={runBatch}>{busy ? "Drafting…" : `Draft ${batch65.length} remaining`}</Button>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[["Not started", batch65.length], ["Ready to sign", thisMonth65.filter((f) => actionBucket(f) === "sign").length],
                    ["Need a fix", thisMonth65.filter((f) => actionBucket(f) === "fix").length], ["Signed or filed", thisMonth65.filter((f) => ["osb", "filed"].includes(actionBucket(f))).length]]
                    .map(([l, n]) => <div key={l as string} className="rounded border p-2"><p className="text-xs text-muted-foreground">{l}</p><p className="text-lg font-semibold">{n}</p></div>)}
                </div>
                <p className="text-xs text-muted-foreground">Review exceptions first under "Need a fix", then sign the clean set from the Sign queue. Automatic debtor reminders aren't connected yet.</p>
                {thisMonth65.filter((f) => actionBucket(f) === "fix").map((f) => <Row key={f.id} f={f} t={t} />)}
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-2">
              {rejected.length ? rejected.map((f) => (
                <div key={f.id} className="space-y-1">
                  <Row f={f} t={t} />
                  <p className="pl-3 text-xs text-muted-foreground">OSB said: {f.osb_response?.message ?? "no message recorded"}{f.osb_reference ? ` · Ref ${f.osb_reference}` : ""}</p>
                </div>
              )) : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No rejections.</p>}
            </TabsContent>

            <TabsContent value="filed" className="space-y-2">
              {filed.length ? filed.map((f) => <Row key={f.id} f={f} t={t} />) : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No accepted filings yet.</p>}
            </TabsContent>

            <TabsContent value="calendar"><Calendar items={calendarItems} t={t} /></TabsContent>
          </Tabs>
          )
        )}
      </div>
    </MainLayout>
  );
};
export default FilingCentrePage;

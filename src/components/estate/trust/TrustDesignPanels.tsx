import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, CircleDot, CreditCard, FileUp, Landmark, Lock, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { auditReadiness, depositSplit, fmt, threeWay, type AccountingCheck, type Reconciliation, type TrustLedger } from "@/lib/trust/trustLedger";

const db = supabase as any;
const NOT_CONNECTED = "Posting from this panel turns on once the bank feed and PAD connection are set up.";

function DisabledPost({ reasons, label }: { reasons: string[]; label: string }) {
  return <TooltipProvider><Tooltip><TooltipTrigger asChild><span tabIndex={0}><Button disabled>{label}</Button></span></TooltipTrigger><TooltipContent className="max-w-xs"><ul className="space-y-1 text-xs">{reasons.map(r => <li key={r}>{r}</li>)}</ul></TooltipContent></Tooltip></TooltipProvider>;
}

/* ---------- Today: three status tiles ---------- */
export function StatusTiles({ ledger, last, clockState, onOpen }: { ledger: TrustLedger; last: Reconciliation | null; clockState?: string; onOpen: (p: string) => void }) {
  const overdue = clockState === "overdue" || clockState === "notice_required" || clockState === "due_soon";
  const tile = (key: string, title: string, sub: string, tone: "info" | "warn", action: string, Icon: any) =>
    <button key={key} onClick={() => onOpen(key)} className={`flex min-w-0 items-start gap-3 rounded-md border p-3 text-left transition-colors hover:bg-muted/50 ${tone === "warn" ? "border-warning/60" : ""}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone === "warn" ? "text-warning" : "text-muted-foreground"}`} />
      <span className="min-w-0"><span className="block text-sm font-medium">{title}</span><span className="block text-xs text-muted-foreground">{sub}</span><span className="mt-1 block text-xs text-primary">{action}</span></span>
    </button>;
  return <div className="grid gap-3 md:grid-cols-3" aria-label="Trust status">
    {tile("pad", "No PAD agreement", "No pre-authorized debit is on file for this estate", "info", "Set up PAD", CreditCard)}
    {tile("collection", "Collection method not set", "Choose Finix or your own bank / provider", "info", "Choose method", Landmark)}
    {last
      ? tile("monthend", `Last reconciled: ${last.statementDate}`, last.reconciledBy ? `Signed ${last.reconciledOn}` : "Prepared, not signed", overdue ? "warn" : "info", overdue ? "Overdue: open month-end" : "Open month-end", Lock)
      : tile("monthend", "Never reconciled", "No month has been signed and locked", "warn", "Start month-end", Lock)}
  </div>;
}

/* ---------- Record deposit ---------- */
type Line = { id: string; name: string; number: string; due: string; amount: string; selected: boolean };
export function RecordDepositPanel({ estate, account, onDone }: { estate: { id?: string; name: string; number: string }; account: string; onDone: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState("");
  const [lines, setLines] = useState<Line[]>([{ id: estate.id ?? "this", name: estate.name, number: estate.number, due: "—", amount: "", selected: true }]);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(false);
  const found = useQuery({ queryKey: ["deposit-estate-search", search], enabled: search.length > 1, queryFn: async () => (await db.from("estates").select("id, debtor_name, file_number").ilike("debtor_name", `%${search}%`).limit(5)).data ?? [] });
  const split = depositSplit(Number(amount) || 0, lines.map(l => ({ selected: l.selected, amount: Number(l.amount) || 0 })));
  const set = (id: string, patch: Partial<Line>) => setLines(ls => ls.map(l => l.id === id ? { ...l, ...patch } : l));
  return <div className="space-y-5">
    <p className="text-sm text-muted-foreground">Split one bank deposit across the estates it belongs to.</p>
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="text-xs text-muted-foreground">Trust account<p className="mt-1 text-sm text-foreground">{account}</p></label>
      <label className="text-xs text-muted-foreground">Deposit date<Input type="date" className="mt-1" value={date} onChange={e => setDate(e.target.value)} /></label>
      <label className="text-xs text-muted-foreground">Deposit amount<Input inputMode="decimal" className="mt-1 font-mono" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></label>
    </div>
    <Button variant="link" className="h-auto p-0 text-xs" disabled title="No statement lines imported yet">or pick a statement line</Button>
    <div className="divide-y border-y">{lines.map(l => <div key={l.id} className="grid grid-cols-[auto_1fr_auto_8rem] items-center gap-3 py-2 text-sm">
      <Checkbox checked={l.selected} onCheckedChange={v => set(l.id, { selected: Boolean(v) })} aria-label={`Include ${l.name}`} />
      <span className="min-w-0"><span className="block truncate font-medium">{l.name}</span><span className="text-xs text-muted-foreground">{l.number || "No estate number"}</span></span>
      <span className="text-xs text-muted-foreground">Due {l.due}</span>
      <Input inputMode="decimal" aria-label={`Amount for ${l.name}`} className="text-right font-mono" placeholder="0.00" value={l.amount} onChange={e => set(l.id, { amount: e.target.value })} />
    </div>)}</div>
    <div className="relative"><Input placeholder="Add estate (unscheduled receipt)" value={search} onChange={e => setSearch(e.target.value)} />
      {search.length > 1 && <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow">{(found.data ?? []).map((e: any) => <button key={e.id} className="block w-full px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => { setLines(ls => ls.some(x => x.id === e.id) ? ls : [...ls, { id: e.id, name: e.debtor_name, number: e.file_number ?? "", due: "Unscheduled", amount: "", selected: true }]); setSearch(""); }}>{e.debtor_name} <span className="text-xs text-muted-foreground">{e.file_number}</span></button>)}{found.data && !found.data.length && <p className="px-3 py-2 text-xs text-muted-foreground">No estates found</p>}</div>}
    </div>
    <div className="grid grid-cols-3 gap-3 rounded-md border p-3 text-sm">
      <div><p className="text-xs text-muted-foreground">Deposit</p><p className="font-mono">{fmt(Number(amount) || 0)}</p></div>
      <div><p className="text-xs text-muted-foreground">Selected</p><p className="font-mono">{fmt(split.selected)}</p></div>
      <div><p className="text-xs text-muted-foreground">Difference</p><p className={`font-mono ${split.difference !== 0 ? "text-destructive" : ""}`}>{fmt(split.difference)}</p></div>
    </div>
    <label className="block text-xs text-muted-foreground">Evidence<Input type="file" className="mt-1" accept=".pdf,.csv,image/*" /></label>
    <details open={preview} onToggle={e => setPreview((e.target as HTMLDetailsElement).open)}><summary className="cursor-pointer text-sm font-medium">Preview the ledger entry ({lines.filter(l => l.selected).length + 1} lines)</summary>
      <table className="mt-2 w-full text-sm"><thead className="text-xs text-muted-foreground"><tr><th className="text-left">Account</th><th className="text-right">Debit</th><th className="text-right">Credit</th></tr></thead><tbody>
        <tr><td>Trust bank</td><td className="text-right font-mono">{fmt(Number(amount) || 0)}</td><td /></tr>
        {lines.filter(l => l.selected).map(l => <tr key={l.id}><td>{l.name}: estate funds</td><td /><td className="text-right font-mono">{fmt(Number(l.amount) || 0)}</td></tr>)}
      </tbody></table></details>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={onDone}>Cancel</Button><DisabledPost label="Post" reasons={[...split.reasons, NOT_CONNECTED]} /></div>
  </div>;
}

/* ---------- Import file ---------- */
export function ImportFilePanel({ account, onDone }: { account: string; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState("statement");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [map, setMap] = useState<Record<number, string>>({});
  const read = async (f: File) => { setFile(f); if (!f.name.toLowerCase().endsWith(".csv")) { setHeaders([]); setRows([]); return; } const lines = (await f.text()).split(/\r?\n/).filter(Boolean).map(l => l.split(",").map(c => c.replace(/^"|"$/g, "").trim())); setHeaders(lines[0] ?? []); setRows(lines.slice(1)); };
  const steps = ["Upload", "Map columns", "Review"];
  return <div className="space-y-5">
    <ol className="flex gap-2 text-xs">{steps.map((s, i) => <li key={s} className={`flex-1 border-t-2 pt-1 ${step > i ? "border-primary text-foreground" : "border-muted text-muted-foreground"}`}>{i + 1} {s}</li>)}</ol>
    {step === 1 && <div className="space-y-3">
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed p-8 text-sm text-muted-foreground"><Upload className="h-6 w-6" />{file ? file.name : "Drop a CSV file or click to choose"}<input type="file" accept=".csv" className="sr-only" onChange={e => e.target.files?.[0] && read(e.target.files[0])} /></label>
      <div className="grid gap-3 sm:grid-cols-2"><div><p className="mb-1 text-xs text-muted-foreground">File type</p><Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="statement">Bank statement</SelectItem><SelectItem value="pad">PAD provider report</SelectItem><SelectItem value="returns">Returns report</SelectItem></SelectContent></Select></div><div><p className="mb-1 text-xs text-muted-foreground">Trust account</p><p className="text-sm">{account}</p></div></div>
      <div className="flex justify-end"><Button disabled={!headers.length} onClick={() => setStep(2)}>Next</Button></div>
    </div>}
    {step === 2 && <div className="space-y-3">{headers.map((h, i) => <div key={i} className="grid grid-cols-2 items-center gap-3 text-sm"><span className="truncate">{h || `Column ${i + 1}`}</span><Select value={map[i] ?? "ignore"} onValueChange={v => setMap(m => ({ ...m, [i]: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["date", "amount", "payer", "estate", "reference", "ignore"].map(v => <SelectItem key={v} value={v}>{({ date: "Date", amount: "Amount", payer: "Payer", estate: "Estate number", reference: "Reference", ignore: "Ignore" } as any)[v]}</SelectItem>)}</SelectContent></Select></div>)}
      <div className="flex justify-between"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button disabled={!Object.values(map).includes("amount") || !Object.values(map).includes("date")} onClick={() => setStep(3)}>Review</Button></div></div>}
    {step === 3 && (() => { const estIdx = Object.entries(map).find(([, v]) => v === "estate")?.[0]; const matched = estIdx ? rows.filter(r => r[Number(estIdx)]).length : 0; return <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 text-sm"><div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Matched</p><p className="font-mono text-lg">{matched}</p></div><div className="rounded-md border border-warning/60 p-3"><p className="text-xs text-muted-foreground">Needs a decision</p><p className="font-mono text-lg">{rows.length - matched}</p></div><div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Already imported</p><p className="font-mono text-lg">0</p></div></div>
      {rows.length - matched > 0 && <p className="text-sm text-muted-foreground">Unmatched rows will wait on Today until each is matched. Nothing posts until then.</p>}
      <div className="flex justify-between"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><div className="flex gap-2"><Button variant="outline" onClick={onDone}>Close</Button><DisabledPost label="Post matched" reasons={[NOT_CONNECTED]} /></div></div>
    </div>; })()}
  </div>;
}

/* ---------- Record return ---------- */
export function RecordReturnPanel({ ledger, missed, onDone }: { ledger: TrustLedger; missed: number; onDone: () => void }) {
  const candidates = ledger.receipts.filter(r => !r.reversedById && !r.reversalOf);
  const [id, setId] = useState(candidates[0]?.id ?? "");
  const [reason, setReason] = useState("nsf");
  const r = candidates.find(c => c.id === id);
  return <div className="space-y-4">
    <div><p className="mb-1 text-xs text-muted-foreground">Receipt</p>{candidates.length ? <Select value={id} onValueChange={setId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.date} · {c.payer} · {fmt(c.amount)}</SelectItem>)}</SelectContent></Select> : <p className="text-sm text-muted-foreground">No receipts to reverse.</p>}</div>
    <div className="grid gap-3 sm:grid-cols-2"><div><p className="mb-1 text-xs text-muted-foreground">Reason</p><Select value={reason} onValueChange={setReason}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[["nsf", "NSF"], ["closed", "Account closed"], ["stopped", "Payment stopped"], ["nodebit", "No debit allowed"], ["unauth", "Not authorized"], ["other", "Other"]].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div><label className="text-xs text-muted-foreground">Return date<Input type="date" className="mt-1" defaultValue={new Date().toISOString().slice(0, 10)} /></label></div>
    <label className="block text-xs text-muted-foreground">Evidence<Input type="file" className="mt-1" /></label>
    {r && <p className="rounded-md border p-3 text-sm">Reverses <span className="font-mono">{fmt(r.amount)}</span> from {r.payer}. Missed payments on this estate: {missed + 1}.</p>}
    <p className="text-xs text-muted-foreground">Posted entries are never deleted. A reversal is a new line linked to the original.</p>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={onDone}>Cancel</Button><DisabledPost label="Post reversal" reasons={[r ? NOT_CONNECTED : "Choose a receipt"]} /></div>
  </div>;
}

/* ---------- Month-end three-way card ---------- */
export function MonthEndCard({ ledger, last, bookBalance, onPrepare }: { ledger: TrustLedger; last: Reconciliation | null; bookBalance: number; onPrepare: () => void }) {
  const dit = ledger.receipts.filter(r => !r.clearedOnStatement && !r.reversalOf);
  const oc = ledger.disbursements.filter(d => !d.cleared);
  const ditSum = dit.reduce((a, r) => a + r.amount, 0), ocSum = oc.reduce((a, d) => a + d.amount, 0);
  const w = threeWay({ statementBalance: last ? last.statementBalance : null, depositsInTransit: ditSum, outstandingCheques: ocSum, bookBalance, estateBalances: bookBalance });
  const locked = Boolean(last?.reconciledBy);
  const fig = (label: string, v: number | null, sub: string) => <div className="min-w-0 text-center"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-mono text-2xl font-semibold">{v === null ? "—" : fmt(v)}</p><p className="text-xs text-muted-foreground">{sub}</p></div>;
  return <section className="space-y-4 rounded-md border p-4">
    <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">{fig("Adjusted bank balance", w.adjustedBank, last ? "statement, adjusted" : "no statement recorded")}<span className="hidden text-xl text-muted-foreground md:block">=</span>{fig("Book balance", bookBalance, "trust control account")}<span className="hidden text-xl text-muted-foreground md:block">=</span>{fig("Sum of estate balances", bookBalance, "this estate only · pooled membership not connected")}</div>
    <p className={`flex items-center gap-2 text-sm font-medium ${w.state === "ready" ? "text-primary" : w.state === "blocked_difference" ? "text-destructive" : "text-warning"}`}><CircleDot className="h-4 w-4" />{w.state === "ready" ? "Difference $0.00 · Ready to sign: all three figures agree" : w.state === "blocked_difference" ? `Blocked · Difference ${fmt(w.difference!)}` : "Blocked · Record the bank statement to compare"}</p>
    <div className="grid gap-4 md:grid-cols-2 text-sm">
      <div><h4 className="mb-2 font-medium">How the bank figure is built</h4><dl className="divide-y border-y">{[["Statement closing balance", last ? fmt(last.statementBalance) : "—"], ["Plus deposits in transit", fmt(ditSum)], ["Minus outstanding cheques", `(${fmt(ocSum)})`], ["Adjusted bank balance", w.adjustedBank === null ? "—" : fmt(w.adjustedBank)]].map(([k, v], i) => <div key={k} className={`flex justify-between py-2 ${i === 3 ? "font-semibold" : ""}`}><dt>{k}</dt><dd className="font-mono">{v}</dd></div>)}</dl></div>
      <div className="space-y-3"><div><h4 className="font-medium">Deposits in transit ({dit.length})</h4>{dit.slice(0, 5).map(r => <div key={r.id} className="flex justify-between py-1"><span>{r.payer}, {r.date} <Badge variant="outline" className="ml-1 text-[10px]">Manual</Badge></span><span className="font-mono">{fmt(r.amount)}</span></div>)}</div><div><h4 className="font-medium">Outstanding cheques ({oc.length})</h4>{oc.slice(0, 5).map(d => <div key={d.id} className="flex justify-between py-1"><span>{d.reference || d.payee}, {d.date}</span><span className="font-mono">{fmt(d.amount)}</span></div>)}</div></div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground"><span>{locked ? `Locked · signed by ${last!.reconciledBy} on ${last!.reconciledOn}. Entries dated in this month are refused.` : "After locking, entries dated in this month are refused."}</span>{locked ? <Badge variant="outline"><Lock className="mr-1 h-3 w-3" />Locked</Badge> : <div className="flex gap-2"><Button variant="outline" size="sm" onClick={onPrepare}>Prepare reconciliation</Button>{w.state === "ready" ? <Button size="sm" onClick={onPrepare}><Lock className="mr-1 h-3.5 w-3.5" />Sign and lock month</Button> : <DisabledPost label="Sign and lock month" reasons={["Bank, book and estates must agree first"]} />}</div>}</div>
  </section>;
}

/* ---------- Audit package ---------- */
const CONTENTS = ["Summary (PDF)", "Ledger (CSV, PDF)", "Reconciliations with statements (PDF)", "Deposit splits with evidence (CSV)", "PAD register and agreements (CSV, PDF)", "Schedule vs actual (CSV)", "Returns and corrections (CSV)", "Suspense and holdbacks (CSV)", "SRD (PDF, XML draft)", "Rule checks (CSV)", "Audit trail, hash-chained (JSON)", "manifest.json and README"];
export function AuditPackageCard({ ledger, checks, onFix, onDownload, lastExport }: { ledger: TrustLedger; checks: AccountingCheck[]; onFix: (k: string) => void; onDownload: () => Promise<void>; lastExport?: { at: string; hash: string } | null }) {
  const [scope, setScope] = useState("estate");
  const [busy, setBusy] = useState(false);
  const r = useMemo(() => auditReadiness(ledger, checks, new Date().toISOString().slice(0, 10)), [ledger, checks]);
  return <section className="space-y-4 rounded-md border p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" />Audit package</h3><p className="text-sm text-muted-foreground">One download an auditor can check against its own hashes.</p></div>
      <div className="flex rounded-md border p-0.5 text-xs">{[["estate", "This estate"], ["month", "Trust account, one month"]].map(([v, l]) => <button key={v} onClick={() => setScope(v)} className={`rounded px-2 py-1 ${scope === v ? "bg-secondary" : ""}`} disabled={v === "month"} title={v === "month" ? "Needs every estate in the pooled account" : undefined}>{l}</button>)}</div></div>
    <div className="grid gap-4 md:grid-cols-2">
      <div><h4 className="mb-2 text-sm font-medium">Readiness</h4><ul className="space-y-1.5 text-sm">{r.items.map(i => <li key={i.key} className="flex items-center gap-2">{i.ok ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <CircleDot className="h-4 w-4 text-warning" />}{i.ok || !i.fix ? i.label : <button className="text-left underline-offset-2 hover:underline" onClick={() => onFix(i.fix!)}>{i.label}</button>}</li>)}</ul>
        {r.draft && <p className="mt-3 border-l-2 border-warning pl-3 text-sm"><span className="font-medium">This package will be marked Draft.</span> The {r.open} open item{r.open > 1 ? "s are" : " is"} listed on page one.</p>}</div>
      <div><h4 className="mb-2 text-sm font-medium">Contents ({CONTENTS.length} files)</h4><ul className="grid gap-1 text-xs text-muted-foreground">{CONTENTS.map(c => <li key={c} className="flex items-center gap-1"><FileUp className="h-3 w-3" />{c}</li>)}</ul></div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3"><span className="text-xs text-muted-foreground">{lastExport ? `Last export ${lastExport.at}, SHA-256 ${lastExport.hash.slice(0, 4)}…${lastExport.hash.slice(-3)}` : "Not exported yet"}</span><Button disabled={busy} onClick={async () => { setBusy(true); try { await onDownload(); } finally { setBusy(false); } }}>{busy ? "Generating…" : "Download audit package"}</Button></div>
  </section>;
}

/* ---------- PAD side panel ---------- */
export function PadPanel({ missed, onDone }: { missed: number; onDone: () => void }) {
  const [mode, setMode] = useState<"view" | "record">("view");
  const [ticks, setTicks] = useState<Record<string, boolean>>({});
  const items = ["Recourse statement", "Cancellation terms", "Pre-notification", "Processor named"];
  if (mode === "record") return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">For firms not collecting through Finix: record the signed agreement.</p>
    <label className="block text-xs text-muted-foreground">Signed agreement<Input type="file" accept=".pdf" className="mt-1" /></label>
    <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs text-muted-foreground">Amount<Input inputMode="decimal" className="mt-1 font-mono" /></label><label className="text-xs text-muted-foreground">First debit<Input type="date" className="mt-1" /></label></div>
    <div className="space-y-2">{items.map(i => <label key={i} className="flex items-center gap-2 text-sm"><Checkbox checked={!!ticks[i]} onCheckedChange={v => setTicks(t => ({ ...t, [i]: Boolean(v) }))} />{i}</label>)}</div>
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setMode("view")}>Back</Button><DisabledPost label="Save agreement" reasons={[...items.filter(i => !ticks[i]).map(i => `Confirm: ${i}`), NOT_CONNECTED]} /></div>
  </div>;
  return <div className="space-y-4 text-sm">
    <div className="flex items-center gap-2"><Badge variant="outline">No PAD agreement</Badge>{missed > 0 && <Badge variant="outline" className="border-warning text-warning"><AlertTriangle className="mr-1 h-3 w-3" />{missed} missed</Badge>}</div>
    <dl className="divide-y border-y">{[["Bank", "Not recorded"], ["Schedule", "Not set"], ["Next debit", "—"], ["Agreement", "None on file"]].map(([k, v]) => <div key={k} className="flex justify-between py-2"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}</dl>
    <div className="flex flex-wrap gap-2"><Button variant="outline" disabled title="Needs Finix connection">Send to debtor</Button><Button variant="outline" onClick={() => setMode("record")}>Record agreement</Button><Button variant="ghost" onClick={onDone}>Close</Button></div>
  </div>;
}

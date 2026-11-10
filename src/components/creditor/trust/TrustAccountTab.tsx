import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, ShieldCheck, ArrowDownLeft, ArrowUpRight, Scale, FileSpreadsheet, Undo2, Download } from "lucide-react";
import { toast } from "sonner";
import { useTrustLedger, trustStore } from "@/lib/trust/trustStore";
import {
  computeBalances, lastReconciliation, buildSRD, fmt, RECEIPT_LABEL, DISB_LABEL,
  type ReceiptSource, type DisbursementKind,
} from "@/lib/trust/trustLedger";

const today = () => new Date().toISOString().slice(0, 10);

function Stat({ label, value, hint, strong }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-mono mt-1 ${strong ? "text-2xl font-bold text-primary" : "text-lg font-semibold"}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}

export function TrustAccountTab() {
  const l = useTrustLedger();
  const b = useMemo(() => computeBalances(l), [l]);
  const last = lastReconciliation(l);
  const srd = useMemo(() => buildSRD(l), [l]);

  const [rc, setRc] = useState({ date: today(), source: "pad_payment" as ReceiptSource, payer: "", ref: "", amount: "" });
  const [dc, setDc] = useState({ date: today(), kind: "trustee_fee" as DisbursementKind, payee: "", ref: "", amount: "" });
  const [stmt, setStmt] = useState({ date: today(), balance: "" });

  // running balance, chronological
  const rows = useMemo(() => {
    const all = [
      ...l.receipts.map((r) => ({ id: r.id, date: r.date, type: "in" as const, label: RECEIPT_LABEL[r.source], who: r.payer, ref: r.sourceRef, amount: r.amount, cleared: r.clearedOnStatement, reversible: !r.reversedById && !r.reversalOf, reversed: !!r.reversedById, approvals: [] as string[] })),
      ...l.disbursements.map((d) => ({ id: d.id, date: d.date, type: "out" as const, label: DISB_LABEL[d.kind], who: d.payee, ref: d.reference, amount: d.amount, cleared: d.cleared, reversible: false, reversed: false, approvals: d.approvals })),
    ].sort((a, b) => a.date.localeCompare(b.date));
    let run = 0;
    return all.map((r) => ({ ...r, balance: (run = Math.round((run + (r.type === "in" ? r.amount : -r.amount)) * 100) / 100) }));
  }, [l]);

  const addReceipt = () => {
    const amount = Number(rc.amount);
    if (!rc.payer || !(amount > 0)) return toast.error("Enter a payer and a positive amount.");
    trustStore.addReceipt({ date: rc.date, depositDate: rc.date, source: rc.source, sourceRef: rc.ref || RECEIPT_LABEL[rc.source], payer: rc.payer, amount, clearedOnStatement: false });
    setRc({ ...rc, payer: "", ref: "", amount: "" });
    toast.success("Receipt posted to trust ledger");
  };
  const addDisb = () => {
    const amount = Number(dc.amount);
    if (!dc.payee || !(amount > 0)) return toast.error("Enter a payee and a positive amount.");
    if (amount > b.ledgerBalance) return toast.error("Disbursement would overdraw the trust account.");
    trustStore.addDisbursement({ date: dc.date, kind: dc.kind, payee: dc.payee, reference: dc.ref, amount, approvals: ["S. Johnson"], cleared: false });
    setDc({ ...dc, payee: "", ref: "", amount: "" });
    toast.success(amount >= (l.account?.dualSignatureThreshold ?? Infinity) ? "Posted — second approval required" : "Disbursement posted");
  };
  const doReconcile = () => {
    const v = Number(stmt.balance);
    if (stmt.balance === "" || Number.isNaN(v)) return toast.error("Enter the bank statement closing balance.");
    const r = trustStore.reconcile(stmt.date, v, "S. Johnson");
    r.difference === 0 ? toast.success("Reconciled — ledger matches bank") : toast.warning(`Difference of ${fmt(r.difference)} recorded`);
    setStmt({ ...stmt, balance: "" });
  };
  const exportSRD = () => {
    const lines = [["Statement of Receipts and Disbursements (draft)"], ["Receipts"], ...srd.receipts.map((r) => [r.label, r.amount.toFixed(2)]), ["Total receipts", srd.totalReceipts.toFixed(2)], [], ["Disbursements"], ...srd.disbursements.map((d) => [d.label, d.amount.toFixed(2)]), ["Total disbursements", srd.totalDisbursements.toFixed(2)], [], ["Balance in trust", srd.balance.toFixed(2)]];
    const blob = new Blob([lines.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "SRD-draft.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      {/* Linked account */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Linked trust account</CardTitle>
              <CardDescription>Directive 5R8 — Estate Funds and Banking · BIA s.25</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1"><ShieldCheck className="h-3 w-3" /> Funds held by trustee, never by SecureFiles</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {l.account ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><div className="text-muted-foreground text-xs">Bank</div><div className="font-medium">{l.account.bank}</div></div>
              <div><div className="text-muted-foreground text-xs">Account</div><div className="font-mono">•••• {l.account.last4}</div></div>
              <div><div className="text-muted-foreground text-xs">Account holder</div><div className="font-medium">{l.account.holder}</div></div>
              <div><div className="text-muted-foreground text-xs">Type · dual-signature over</div><div>{l.account.designation === "estate_specific" ? "Estate-specific" : "Pooled (sub-ledger)"} · {fmt(l.account.dualSignatureThreshold)}</div></div>
            </div>
          ) : <p className="text-sm text-destructive">No trust account linked — receipts cannot be deposited.</p>}
        </CardContent>
      </Card>

      {/* Balance strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Ledger balance" value={fmt(b.ledgerBalance)} hint="Receipts − disbursements" />
        <Stat label="Outstanding cheques" value={fmt(b.outstandingCheques)} hint="Issued, not cleared" />
        <Stat label="Deposits in transit" value={fmt(b.depositsInTransit)} hint="Not yet on statement" />
        <Stat label="Holdbacks & reserve" value={fmt(b.holdbacks + b.reserve)} hint={l.holdbacks.map((h) => h.reason).join("; ") || "None"} />
        <Stat label="Available to distribute" value={fmt(b.available)} hint={last ? `Reconciled ${new Date(last.statementDate + "T00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" })}` : "Not reconciled"} strong />
      </div>

      {/* Ledger */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Trust ledger</CardTitle>
          <CardDescription>Running balance is computed — entries are never edited or deleted; corrections post as reversals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow className="bg-muted/50">
              <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Party · source</TableHead>
              <TableHead className="text-right">In</TableHead><TableHead className="text-right">Out</TableHead>
              <TableHead className="text-right">Balance</TableHead><TableHead>Status</TableHead><TableHead />
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className={r.reversed ? "opacity-60" : ""}>
                  <TableCell className="font-mono text-xs">{r.date}</TableCell>
                  <TableCell className="text-sm">{r.type === "in" ? <ArrowDownLeft className="inline h-3.5 w-3.5 mr-1 text-primary" /> : <ArrowUpRight className="inline h-3.5 w-3.5 mr-1 text-muted-foreground" />}{r.label}</TableCell>
                  <TableCell className="text-sm"><div>{r.who}</div><div className="text-xs text-muted-foreground">{r.ref}</div></TableCell>
                  <TableCell className="text-right font-mono">{r.type === "in" ? fmt(r.amount) : ""}</TableCell>
                  <TableCell className="text-right font-mono">{r.type === "out" ? fmt(r.amount) : ""}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{fmt(r.balance)}</TableCell>
                  <TableCell className="space-x-1">
                    <Badge variant="outline" className="text-[10px]">{r.cleared ? "Cleared" : "Outstanding"}</Badge>
                    {r.type === "out" && r.amount >= (l.account?.dualSignatureThreshold ?? Infinity) && <Badge variant={r.approvals.length >= 2 ? "outline" : "destructive"} className="text-[10px]">{r.approvals.length}/2 approvals</Badge>}
                    {r.reversed && <Badge variant="outline" className="text-[10px]">Reversed</Badge>}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {r.reversible && <Button size="sm" variant="ghost" onClick={() => trustStore.reverseReceipt(r.id)} title="Post reversal (NSF / error)"><Undo2 className="h-3.5 w-3.5" /></Button>}
                    {r.type === "out" && !r.cleared && <Button size="sm" variant="ghost" onClick={() => trustStore.markCleared(r.id)}>Mark cleared</Button>}
                    {r.type === "out" && r.approvals.length < 2 && r.amount >= (l.account?.dualSignatureThreshold ?? Infinity) && <Button size="sm" variant="ghost" onClick={() => trustStore.addApproval(r.id, "M. Brown")}>2nd approve</Button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Post receipt / disbursement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ArrowDownLeft className="h-4 w-4" /> Post receipt</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div><Label>Date received</Label><Input type="date" value={rc.date} onChange={(e) => setRc({ ...rc, date: e.target.value })} /></div>
            <div><Label>Source</Label>
              <Select value={rc.source} onValueChange={(v) => setRc({ ...rc, source: v as ReceiptSource })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(RECEIPT_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label>Payer</Label><Input value={rc.payer} onChange={(e) => setRc({ ...rc, payer: e.target.value })} /></div>
            <div><Label>Amount</Label><Input type="number" step="0.01" value={rc.amount} onChange={(e) => setRc({ ...rc, amount: e.target.value })} /></div>
            <div className="col-span-2"><Label>Tied to (PAD run, asset, CRA notice…)</Label><Input value={rc.ref} onChange={(e) => setRc({ ...rc, ref: e.target.value })} /></div>
            <Button className="col-span-2" onClick={addReceipt}>Post receipt</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><ArrowUpRight className="h-4 w-4" /> Post disbursement</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={dc.date} onChange={(e) => setDc({ ...dc, date: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={dc.kind} onValueChange={(v) => setDc({ ...dc, kind: v as DisbursementKind })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(DISB_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label>Payee</Label><Input value={dc.payee} onChange={(e) => setDc({ ...dc, payee: e.target.value })} /></div>
            <div><Label>Amount</Label><Input type="number" step="0.01" value={dc.amount} onChange={(e) => setDc({ ...dc, amount: e.target.value })} /></div>
            <div className="col-span-2"><Label>Reference / authority</Label><Input value={dc.ref} onChange={(e) => setDc({ ...dc, ref: e.target.value })} /></div>
            <Button className="col-span-2" onClick={addDisb}>Post disbursement</Button>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation + SRD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4" /> Bank reconciliation</CardTitle>
            <CardDescription>{last ? `Last: statement ${last.statementDate}, by ${last.reconciledBy} — difference ${fmt(last.difference)}` : "Never reconciled"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Statement date</Label><Input type="date" value={stmt.date} onChange={(e) => setStmt({ ...stmt, date: e.target.value })} /></div>
              <div><Label>Statement closing balance</Label><Input type="number" step="0.01" value={stmt.balance} onChange={(e) => setStmt({ ...stmt, balance: e.target.value })} /></div>
            </div>
            <div className="text-xs text-muted-foreground font-mono space-y-0.5">
              <div>+ deposits in transit {fmt(b.depositsInTransit)}</div>
              <div>− outstanding cheques {fmt(b.outstandingCheques)}</div>
              <div>= must equal ledger {fmt(b.ledgerBalance)}</div>
            </div>
            <Button onClick={doReconcile} className="w-full">Reconcile</Button>
            <Table>
              <TableHeader><TableRow><TableHead>Statement</TableHead><TableHead className="text-right">Bank</TableHead><TableHead className="text-right">Ledger</TableHead><TableHead className="text-right">Diff.</TableHead></TableRow></TableHeader>
              <TableBody>{[...l.reconciliations].reverse().map((r) => (
                <TableRow key={r.id}><TableCell className="font-mono text-xs">{r.statementDate}</TableCell><TableCell className="text-right font-mono">{fmt(r.statementBalance)}</TableCell><TableCell className="text-right font-mono">{fmt(r.ledgerBalanceAtDate)}</TableCell><TableCell className={`text-right font-mono ${r.difference ? "text-destructive font-semibold" : ""}`}>{fmt(r.difference)}</TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4" /> Statement of Receipts and Disbursements</CardTitle>
                <CardDescription>Draft — builds itself from the ledger</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportSRD}><Download className="h-3.5 w-3.5 mr-1" /> CSV</Button>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <div className="font-medium mb-1">Receipts</div>
              {srd.receipts.map((r) => <div key={r.key} className="flex justify-between"><span className="text-muted-foreground">{r.label}</span><span className="font-mono">{fmt(r.amount)}</span></div>)}
              <div className="flex justify-between border-t mt-1 pt-1 font-medium"><span>Total receipts</span><span className="font-mono">{fmt(srd.totalReceipts)}</span></div>
            </div>
            <div>
              <div className="font-medium mb-1">Disbursements</div>
              {srd.disbursements.map((d) => <div key={d.key} className="flex justify-between"><span className="text-muted-foreground">{d.label}</span><span className="font-mono">{fmt(d.amount)}</span></div>)}
              <div className="flex justify-between border-t mt-1 pt-1 font-medium"><span>Total disbursements</span><span className="font-mono">{fmt(srd.totalDisbursements)}</span></div>
            </div>
            <div className="flex justify-between rounded-md bg-primary/10 p-2 font-semibold"><span>Balance in trust</span><span className="font-mono">{fmt(srd.balance)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Landmark, ShieldCheck } from "lucide-react";
import { useEstateTrustLedger } from "@/hooks/useEstateTrustLedger";
import { buildSRD, fmt, lastReconciliation, runningTrustLedger, srdEvidenceStatus } from "@/lib/trust/trustLedger";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { logEstateEvent } from "@/hooks/useEstateRecords";
import { FinancialsTab } from "./FinancialsTab";
import { TrustRiskFlags } from "@/components/creditor/trust/TrustRiskFlags";

export function EstateTrustAccount({ estateId }: { estateId?: string }) {
  const { ledger, balances, checks, bankLines, reconciliationRecords, isLoading, error } = useEstateTrustLedger(estateId);
  const [entryTab, setEntryTab] = useState("accounts");
  const last = lastReconciliation(ledger);
  const rows = runningTrustLedger(ledger);
  const evidence = srdEvidenceStatus(ledger, checks);
  const srd = buildSRD(ledger);
  const [view, setView] = useState("ledger");
  const exportSRD = async (verified = false) => {
    if (verified && !evidence.ready) return;
    const preparedAt = new Date().toISOString();
    const proof = JSON.stringify({ estateId, preparedAt, ledger, checks });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(proof));
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    if (estateId) await logEstateEvent({ estateId, eventType: "estate.srd.exported", after: { hash, preparedAt, verified, blockers: evidence.blockers } });
    const rows = [[verified ? "Evidence-backed SRD" : "UNVERIFIED DRAFT SRD", estateId ?? ""], ["Prepared at", preparedAt], ["SHA-256 evidence digest", hash], ["Evidence state", evidence.ready ? "Checks passed" : evidence.blockers.join("; ")], ["Source", "Posted trust-bank ledger entries"], ...srd.receipts.map(r => [r.label, r.amount.toFixed(2)]), ["Total receipts", srd.totalReceipts.toFixed(2)], ...srd.disbursements.map(d => [d.label, d.amount.toFixed(2)]), ["Total disbursements", srd.totalDisbursements.toFixed(2)], ["Balance", srd.balance.toFixed(2)]];
    const url = URL.createObjectURL(new Blob([rows.map(row => row.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `estate-${estateId}-SRD-draft.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <div className="flex items-center gap-2"><Landmark className="h-5 w-5" /><span className="font-medium">{ledger.account ? `${ledger.account.bank} · •••• ${ledger.account.last4}` : "No linked trust account"}</span></div>
      <Button variant="outline" onClick={() => exportSRD()} disabled={isLoading || Boolean(error) || !estateId}><Download className="mr-2 h-4 w-4" /> Draft SRD</Button>
    </div>
    <div className="grid gap-4 border-b pb-5 sm:grid-cols-3">
      <div><p className="text-xs text-muted-foreground">Trust balance</p><p className="mt-1 font-mono text-2xl">{isLoading ? "Loading…" : error ? "Unavailable" : fmt(balances.ledgerBalance)}</p><p className="text-xs text-muted-foreground">{last ? `Statement ${last.statementDate} · ${last.notes}` : "Not reconciled"}</p></div>
      <div><p className="text-xs text-muted-foreground">Receipts / disbursements</p><p className="mt-1 font-mono text-lg">{fmt(balances.totalReceipts)} / {fmt(balances.totalDisbursements)}</p></div>
      <div><p className="text-xs text-muted-foreground">Available to distribute</p><p className="mt-1 font-medium text-warning">Assessment blocked</p><p className="mt-1 text-xs text-muted-foreground">{checks.filter(c => c.status !== "met").length} accounting checks require evidence or correction.</p></div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => { setView("entry"); setEntryTab("receipts"); }}>Record receipt</Button>
      <Button variant="outline" onClick={() => { setView("entry"); setEntryTab("disbursements"); }}>Record payment</Button>
      <Button variant="outline" onClick={() => { setView("entry"); setEntryTab("reconciliation"); }}>Prepare reconciliation</Button>
    </div>
    {error && <p role="alert" className="text-destructive">Accounting evidence could not be loaded. Figures are not verified.</p>}
    <Tabs value={view} onValueChange={setView}>
      <div className="overflow-x-auto"><TabsList className="w-max">
        <TabsTrigger value="ledger">Estate ledger</TabsTrigger><TabsTrigger value="bank">Bank evidence</TabsTrigger><TabsTrigger value="monthly">Monthly reconciliation</TabsTrigger><TabsTrigger value="checks">Accounting checks</TabsTrigger><TabsTrigger value="srd">SRD &amp; proof</TabsTrigger><TabsTrigger value="entry">Record money</TabsTrigger>
      </TabsList></div>
      <TabsContent value="ledger" className="pt-4">
        <h3 className="mb-3 font-semibold">Estate receipts and disbursements</h3>
        {isLoading ? <p className="text-muted-foreground">Loading postings…</p> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Party / source</TableHead><TableHead>Category</TableHead><TableHead className="text-right">Receipt</TableHead><TableHead className="text-right">Disbursement</TableHead><TableHead className="text-right">Running balance</TableHead><TableHead>Bank match</TableHead></TableRow></TableHeader><TableBody>
        {rows.map(r => <TableRow key={r.id}><TableCell className="whitespace-nowrap">{r.date}</TableCell><TableCell><p>{r.party}</p><p className="max-w-48 break-all text-xs text-muted-foreground">{r.source}</p></TableCell><TableCell>{r.category}</TableCell><TableCell className="text-right font-mono">{r.incoming ? fmt(r.incoming) : "—"}</TableCell><TableCell className="text-right font-mono">{r.outgoing ? fmt(r.outgoing) : "—"}</TableCell><TableCell className={`text-right font-mono ${r.balance < 0 ? "text-destructive" : ""}`}>{fmt(r.balance)}</TableCell><TableCell><Badge variant="outline">{r.matched ? "Statement match" : "Unmatched"}</Badge></TableCell></TableRow>)}
        {!rows.length && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No posted estate transactions.</TableCell></TableRow>}
        </TableBody></Table></div>}
      </TabsContent>
      <TabsContent value="bank" className="space-y-4 pt-4">
        <div className="border-l-2 border-warning pl-4"><h3 className="font-semibold">Read-only bank feed · Not connected</h3><p className="mt-1 text-sm text-muted-foreground">Bank-provider provenance, immutable transaction identifiers and account-wide coverage are missing. Existing statement lines are not treated as a verified bank feed.</p></div>
        <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Bank description</TableHead><TableHead>Amount</TableHead><TableHead>Match</TableHead><TableHead>Linked estate record</TableHead></TableRow></TableHeader><TableBody>{bankLines.map(line => <TableRow key={line.id}><TableCell>{line.line_date ?? "—"}</TableCell><TableCell>{line.description ?? "—"}</TableCell><TableCell className="font-mono">{fmt(Number(line.amount))} · {line.direction}</TableCell><TableCell>{line.match_state}</TableCell><TableCell className="max-w-48 break-all text-xs">{line.matched_receipt_id ?? line.matched_disbursement_id ?? "Not linked"}</TableCell></TableRow>)}{!bankLines.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No statement transactions recorded.</TableCell></TableRow>}</TableBody></Table>
      </TabsContent>
      <TabsContent value="monthly" className="space-y-4 pt-4">
        <h3 className="font-semibold">Monthly bank / estate balance proof</h3><p className="text-sm text-warning">Pooled-account proof blocked: complete estate membership and canonical bank-account identity are not recorded.</p>
        <Table><TableHeader><TableRow><TableHead>Statement month</TableHead><TableHead>Bank closing</TableHead><TableHead>Adjusted bank</TableHead><TableHead>Estate ledger</TableHead><TableHead>Difference</TableHead><TableHead>Review / evidence</TableHead></TableRow></TableHeader><TableBody>{ledger.reconciliations.map(r => <TableRow key={r.id}><TableCell>{r.statementDate}</TableCell><TableCell>{fmt(r.statementBalance)}</TableCell><TableCell>{fmt(r.adjustedBankBalance)}</TableCell><TableCell>{fmt(r.ledgerBalanceAtDate)}</TableCell><TableCell className={r.difference ? "text-destructive" : ""}>{fmt(r.difference)}</TableCell><TableCell>{reconciliationRecords.find(record => record.id === r.id)?.status} · provenance unverified</TableCell></TableRow>)}{!ledger.reconciliations.length && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No monthly reconciliations recorded.</TableCell></TableRow>}</TableBody></Table>
      </TabsContent>
      <TabsContent value="checks" className="divide-y pt-4">{checks.map(check => <div key={check.code} className="flex flex-wrap items-start justify-between gap-3 py-4"><div className="min-w-0 flex-1"><h3 className="font-medium">{check.title}</h3><p className="mt-1 text-sm text-muted-foreground">{check.detail}</p>{check.url ? <a className="text-xs text-primary underline" href={check.url} target="_blank" rel="noreferrer">{check.citation}</a> : <p className="text-xs text-muted-foreground">{check.citation}</p>}</div><Badge variant={check.status === "breach" ? "destructive" : "outline"} className={check.status === "blocked" ? "border-warning text-warning" : ""}>{check.status === "blocked" ? "Assessment blocked" : check.status === "breach" ? "Breach" : "Checked"}</Badge></div>)}</TabsContent>
      <TabsContent value="srd" className="space-y-4 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" /> Statement of Receipts and Disbursements</h3><p className="mt-1 text-sm text-warning">{evidence.ready ? "Accounting evidence checked" : "Unverified draft · evidence-backed export blocked"}</p></div><Button disabled={!evidence.ready || isLoading || Boolean(error)} onClick={() => exportSRD(true)}>Export evidence-backed SRD</Button></div>
        <div className="max-w-2xl space-y-2">{srd.receipts.map(r => <div key={r.key} className="flex justify-between gap-4"><span>{r.label}</span><span className="font-mono">{fmt(r.amount)}</span></div>)}<div className="flex justify-between border-t py-2 font-semibold"><span>Total receipts</span><span>{fmt(srd.totalReceipts)}</span></div>{srd.disbursements.map(d => <div key={d.key} className="flex justify-between gap-4"><span>{d.label}</span><span className="font-mono">{fmt(d.amount)}</span></div>)}<div className="flex justify-between border-t py-2 font-semibold"><span>Total disbursements</span><span>{fmt(srd.totalDisbursements)}</span></div><div className="flex justify-between border-t py-2 font-semibold"><span>Balance in trust</span><span>{fmt(srd.balance)}</span></div></div>
        <ul className="space-y-2 text-sm text-muted-foreground">{evidence.blockers.map(reason => <li key={reason}>{reason}</li>)}</ul>
      </TabsContent>
      <TabsContent value="entry" className="pt-4"><FinancialsTab key={entryTab} estateId={estateId} initialTab={entryTab} /></TabsContent>
    </Tabs>
    <TrustRiskFlags estateId={estateId} onOpenTrust={() => setEntryTab("reconciliation")} />
  </div>;
}
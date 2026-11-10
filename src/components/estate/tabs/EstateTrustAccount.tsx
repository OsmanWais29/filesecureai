import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Landmark } from "lucide-react";
import { useEstateTrustLedger } from "@/hooks/useEstateTrustLedger";
import { buildSRD, fmt, lastReconciliation } from "@/lib/trust/trustLedger";
import { FinancialsTab } from "./FinancialsTab";
import { TrustRiskFlags } from "@/components/creditor/trust/TrustRiskFlags";

export function EstateTrustAccount({ estateId }: { estateId?: string }) {
  const { ledger, balances, isLoading, error } = useEstateTrustLedger(estateId);
  const [entryTab, setEntryTab] = useState("accounts");
  const last = lastReconciliation(ledger);
  const exportSRD = () => {
    const srd = buildSRD(ledger);
    const rows = [["Draft SRD", estateId ?? ""], ["Source", "Posted trust-bank ledger entries"], ...srd.receipts.map(r => [r.label, r.amount.toFixed(2)]), ["Total receipts", srd.totalReceipts.toFixed(2)], ...srd.disbursements.map(d => [d.label, d.amount.toFixed(2)]), ["Total disbursements", srd.totalDisbursements.toFixed(2)], ["Balance", srd.balance.toFixed(2)]];
    const url = URL.createObjectURL(new Blob([rows.map(row => row.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `estate-${estateId}-SRD-draft.csv`; a.click(); URL.revokeObjectURL(url);
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
      <div className="flex items-center gap-2"><Landmark className="h-5 w-5" /><span className="font-medium">{ledger.account ? `${ledger.account.bank} · •••• ${ledger.account.last4}` : "No linked trust account"}</span></div>
      <Button variant="outline" onClick={exportSRD} disabled={isLoading || Boolean(error) || !estateId}><Download className="mr-2 h-4 w-4" /> Draft SRD</Button>
    </div>
    <div className="grid gap-4 border-b pb-5 sm:grid-cols-3">
      <div><p className="text-xs text-muted-foreground">Trust balance</p><p className="mt-1 font-mono text-2xl">{isLoading ? "Loading…" : error ? "Unavailable" : fmt(balances.ledgerBalance)}</p><p className="text-xs text-muted-foreground">{last ? `Statement ${last.statementDate} · ${last.notes}` : "Not reconciled"}</p></div>
      <div><p className="text-xs text-muted-foreground">Receipts / disbursements</p><p className="mt-1 font-mono text-lg">{fmt(balances.totalReceipts)} / {fmt(balances.totalDisbursements)}</p></div>
      <div><p className="text-xs text-muted-foreground">Available to distribute</p><p className="mt-1 font-medium text-warning">Assessment blocked</p><ul className="mt-1 text-xs text-muted-foreground">{ledger.assessmentBlockers?.map(reason => <li key={reason}>{reason}</li>)}</ul></div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setEntryTab("receipts")}>Record receipt</Button>
      <Button variant="outline" onClick={() => setEntryTab("disbursements")}>Record payment</Button>
      <Button variant="outline" onClick={() => setEntryTab("reconciliation")}>Prepare reconciliation</Button>
    </div>
    <FinancialsTab key={entryTab} estateId={estateId} initialTab={entryTab} />
    <TrustRiskFlags estateId={estateId} onOpenTrust={() => setEntryTab("reconciliation")} />
  </div>;
}
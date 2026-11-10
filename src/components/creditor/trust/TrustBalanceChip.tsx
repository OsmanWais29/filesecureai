import { Landmark } from "lucide-react";
import { useEstateTrustLedger } from "@/hooks/useEstateTrustLedger";
import { Button } from "@/components/ui/button";
import { computeBalances, lastReconciliation, daysBetween, RECON_MAX_AGE_DAYS, fmt } from "@/lib/trust/trustLedger";

export function TrustBalanceChip({ estateId, onClick }: { estateId?: string; onClick: () => void }) {
  const { ledger: l, isLoading, error } = useEstateTrustLedger(estateId);
  const b = computeBalances(l);
  const last = lastReconciliation(l);
  const stale = !last || daysBetween(last.statementDate, new Date().toISOString().slice(0, 10)) > RECON_MAX_AGE_DAYS || last.difference !== 0;
  const when = last ? new Date(last.statementDate + "T00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : null;
  return (
    <Button variant="outline" disabled={!estateId} onClick={onClick} className="h-auto flex items-center gap-2 px-3 py-1.5 text-left" title="Open estate Trust Account">
      <Landmark className="h-4 w-4 text-muted-foreground" />
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Trust Balance</div>
        <div className="text-sm font-mono font-semibold">
          {!estateId ? "Select estate" : isLoading ? "Loading…" : error ? "Unavailable" : fmt(b.ledgerBalance)}
          <span className={`ml-1 font-sans text-xs font-normal ${stale ? "text-destructive" : "text-muted-foreground"}`}>
            · {when ? `reconciled ${when}` : "not reconciled"}
          </span>
        </div>
      </div>
    </Button>
  );
}

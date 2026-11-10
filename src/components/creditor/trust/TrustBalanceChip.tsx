import { Landmark } from "lucide-react";
import { useTrustLedger } from "@/lib/trust/trustStore";
import { computeBalances, lastReconciliation, daysBetween, RECON_MAX_AGE_DAYS, fmt } from "@/lib/trust/trustLedger";

export function TrustBalanceChip({ onClick }: { onClick: () => void }) {
  const l = useTrustLedger();
  const b = computeBalances(l);
  const last = lastReconciliation(l);
  const stale = !last || daysBetween(last.statementDate, new Date().toISOString().slice(0, 10)) > RECON_MAX_AGE_DAYS || last.difference !== 0;
  const when = last ? new Date(last.statementDate + "T00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : null;
  return (
    <button onClick={onClick} className="flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-left hover:bg-muted transition-colors" title="Open Trust Account">
      <Landmark className="h-4 w-4 text-muted-foreground" />
      <div className="leading-tight">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Trust Balance</div>
        <div className="text-sm font-mono font-semibold">
          {fmt(b.ledgerBalance)}
          <span className={`ml-1 font-sans text-xs font-normal ${stale ? "text-destructive" : "text-muted-foreground"}`}>
            · {when ? `reconciled ${when}` : "not reconciled"}
          </span>
        </div>
      </div>
    </button>
  );
}

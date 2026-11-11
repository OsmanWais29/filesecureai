import { Badge } from "@/components/ui/badge";

/** Firm settings > Payments. One row per trust account; no accounts are connected yet. */
export function FirmPaymentsSettings() {
  return <section className="mt-8 space-y-3">
    <div><h2 className="text-lg font-semibold">Payments</h2><p className="text-sm text-muted-foreground">How each trust account collects pre-authorized debits.</p></div>
    <div className="divide-y rounded-md border text-sm">
      <div className="grid grid-cols-3 gap-3 px-4 py-2 text-xs text-muted-foreground"><span>Trust account</span><span>Collection method</span><span>Status</span></div>
      <div className="grid grid-cols-3 gap-3 px-4 py-3"><span className="text-muted-foreground">No trust accounts connected</span><span>No PAD</span><span><Badge variant="outline">Not set</Badge></span></div>
    </div>
    <p className="text-xs text-muted-foreground">A Finix account shows Blocked until its payout is set to Gross, so trust deposits match the bank exactly.</p>
  </section>;
}

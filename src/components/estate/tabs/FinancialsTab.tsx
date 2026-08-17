import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { bankAccount, padBatch, receipts, reconciliation } from "@/data/estateWorkspace";

const money = (n: number) => `$${n.toLocaleString()}`;

export const FinancialsTab = () => (
  <Tabs defaultValue="banking">
    <TabsList className="flex-wrap">
      <TabsTrigger value="banking">Banking</TabsTrigger>
      <TabsTrigger value="receipts">Receipts</TabsTrigger>
      <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
      <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
      <TabsTrigger value="gl">General Ledger</TabsTrigger>
      <TabsTrigger value="pad">PAD / EFT</TabsTrigger>
      <TabsTrigger value="distributions">Distributions</TabsTrigger>
    </TabsList>

    <TabsContent value="banking" className="mt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {bankAccount.name} <span className="text-muted-foreground">{bankAccount.masked}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            ["Statement Balance", bankAccount.statementBalance],
            ["Ledger Balance", bankAccount.ledgerBalance],
            ["Outstanding Deposits", bankAccount.outstandingDeposits],
            ["Outstanding Payments", bankAccount.outstandingPayments],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Adjusted Balance</span>
            <span>{bankAccount.adjustedBalance}</span>
          </div>
          <Badge variant="outline" className="mt-2">
            Reconciled through {bankAccount.reconciledThrough}
          </Badge>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="receipts" className="mt-4 grid gap-4 md:grid-cols-2">
      {receipts.map((r) => {
        const allocated = r.allocations.reduce((s, a) => s + a.amount, 0);
        return (
          <Card key={r.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Receipt #{r.id} · {money(r.total)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">Payment from {r.payer}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {r.allocations.length === 0 && (
                <p className="text-muted-foreground">No allocations recorded.</p>
              )}
              {r.allocations.map((a) => (
                <div key={a.label} className="flex justify-between">
                  <span className="text-muted-foreground">{a.label}</span>
                  <span>{money(a.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>{money(allocated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unallocated</span>
                <span className={r.total - allocated > 0 ? "font-semibold text-destructive" : ""}>
                  {money(r.total - allocated)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </TabsContent>

    <TabsContent value="disbursements" className="mt-4">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Disbursement register posts against the estate ledger with explicit debit/credit entries.
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="reconciliation" className="mt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{reconciliation.period} Reconciliation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Bank statement imported · {reconciliation.imported} transactions
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="text-xl font-semibold">{reconciliation.matched}</div>
              <div className="text-xs text-muted-foreground">Auto matched</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xl font-semibold">{reconciliation.review}</div>
              <div className="text-xs text-muted-foreground">Require review</div>
            </div>
            <div className="rounded-md border border-destructive/40 p-3">
              <div className="text-xl font-semibold text-destructive">{reconciliation.unmatched}</div>
              <div className="text-xs text-muted-foreground">Unmatched</div>
            </div>
          </div>
          <Progress value={(reconciliation.matched / reconciliation.imported) * 100} className="h-2" />
          <div className="space-y-2 text-sm">
            {reconciliation.rows.map((row) => (
              <div key={row.bank} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border p-3">
                <span>{row.bank}</span>
                <span className="text-muted-foreground">{row.state === "matched" ? "↔" : "?"}</span>
                <span className={row.state === "matched" ? "" : "text-destructive"}>{row.match}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-3 font-semibold">
            <span>Difference</span>
            <span className="text-destructive">{reconciliation.difference}</span>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="gl" className="mt-4">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Estate general ledger — every posting is a balanced debit/credit journal entry.
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="pad" className="mt-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{padBatch.month} PAD Batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Debtors</span>
            <span>{padBatch.debtors}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">{padBatch.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valid mandates</span>
            <span>{padBatch.validMandates}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Missing authorization</span>
            <span className="text-destructive">{padBatch.missingAuthorization}</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {padBatch.banks.map((b) => (
              <Badge key={b} variant="outline">
                {b} adapter
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm">Review exceptions</Button>
            <Button size="sm">Generate bank file</Button>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="distributions" className="mt-4">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Dividend calculations draw from admitted claim amounts and the adjusted trust balance.
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
);

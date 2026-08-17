import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, RecordForm, Register, useRecordValues } from "@/components/estate/forms/RecordForm";
import { SubTabs } from "@/components/estate/forms/SubTabs";
import {
  OPTIONS,
  bankAccountSections,
  disbursementSections,
  glAccounts,
  journalHeaderSection,
  receiptSections,
  reconciliationSections,
  scheduleSections,
} from "@/data/estateFormSpecs";
import { bankAccount, reconciliation } from "@/data/estateWorkspace";

const TABS = [
  { id: "accounts", label: "Bank Accounts" },
  { id: "receipts", label: "Receipts" },
  { id: "disbursements", label: "Disbursements" },
  { id: "schedules", label: "Payment Schedules" },
  { id: "reconciliation", label: "Reconciliation" },
  { id: "gl", label: "General Ledger" },
] as const;

const money = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

// --------------------------------------------------------------- Bank accounts
const BankAccounts = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Register
        title="Estate bank accounts"
        description="Account numbers are masked in list views."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add account
          </Button>
        }
      >
        <div className="rounded-md border p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{bankAccount.name}</span>
            <Badge variant="outline">{bankAccount.masked}</Badge>
            <Badge variant="secondary">Default</Badge>
            <span className="ml-auto text-muted-foreground">
              Reconciled through {bankAccount.reconciledThrough}
            </span>
          </div>
          <div className="mt-2 grid gap-2 text-muted-foreground md:grid-cols-4">
            <span>Statement {bankAccount.statementBalance}</span>
            <span>Ledger {bankAccount.ledgerBalance}</span>
            <span>Deposits {bankAccount.outstandingDeposits}</span>
            <span>Payments {bankAccount.outstandingPayments}</span>
          </div>
        </div>
      </Register>
      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add estate bank account"
        sections={bankAccountSections}
        submitLabel="Save account"
        onSubmit={() => toast({ title: "Bank account saved" })}
      />
    </>
  );
};

// -------------------------------------------------------------------- Receipts
interface Allocation {
  id: number;
  account: string;
  amount: string;
}

const ReceiptForm = ({ onDone }: { onDone: () => void }) => {
  const { values, onChange } = useRecordValues({ receiptDate: "", amount: "" });
  const [allocations, setAllocations] = useState<Allocation[]>([
    { id: 1, account: "Surplus Income", amount: "" },
  ]);

  const total = Number(values.amount || 0);
  const allocated = allocations.reduce((s, a) => s + Number(a.amount || 0), 0);
  const unallocated = total - allocated;
  const hasSuspense = allocations.some((a) => a.account === "Suspense / Unallocated");
  const canPost = total > 0 && (Math.abs(unallocated) < 0.005 || hasSuspense);

  const update = (id: number, patch: Partial<Allocation>) =>
    setAllocations((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  return (
    <RecordForm
      sections={receiptSections}
      values={values}
      onChange={onChange}
      submitLabel="Post Receipt"
      onSubmit={() => {
        if (!canPost) {
          toast({
            title: "Cannot post receipt",
            description: "Allocations must reconcile, or route the remainder to the suspense account.",
            variant: "destructive",
          });
          return;
        }
        toast({ title: "Receipt posted", description: `${money(total)} fully allocated.` });
        onDone();
      }}
      footerNote={
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Allocation</CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setAllocations((prev) => [...prev, { id: Date.now(), account: "Surplus Income", amount: "" }])
              }
            >
              <Plus className="mr-1.5 h-4 w-4" /> Add allocation
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {allocations.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <Select value={a.account} onValueChange={(v) => update(a.id, { account: v })}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {OPTIONS.allocationAccount.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  className="w-32"
                  placeholder="0.00"
                  value={a.amount}
                  onChange={(e) => update(a.id, { amount: e.target.value })}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setAllocations((prev) => prev.filter((x) => x.id !== a.id))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="space-y-1 border-t pt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span>{money(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Allocated</span>
                <span>{money(allocated)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Unallocated</span>
                <span className={Math.abs(unallocated) > 0.005 ? "text-destructive" : ""}>
                  {money(unallocated)}
                </span>
              </div>
              {!canPost && total > 0 && (
                <p className="text-xs text-destructive">
                  Posting is blocked until allocations reconcile or a suspense allocation is added.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      }
    />
  );
};

const Receipts = () => {
  const [adding, setAdding] = useState(false);
  if (adding) return <ReceiptForm onDone={() => setAdding(false)} />;
  return (
    <Register
      title="Receipts"
      description="Money received must be allocated before it can be posted."
      action={
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add receipt
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        {[
          { id: "R-10282", payer: "John Smith", total: 1000, allocated: 1000, date: "2026-08-11" },
          { id: "R-10283", payer: "John Smith", total: 900, allocated: 0, date: "2026-08-14" },
        ].map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
            <span className="font-medium">{r.id}</span>
            <span className="text-muted-foreground">{r.payer}</span>
            <span className="text-muted-foreground">{r.date}</span>
            <span className="ml-auto">{money(r.total)}</span>
            <Badge variant={r.allocated === r.total ? "secondary" : "destructive"}>
              {r.allocated === r.total ? "Allocated" : `Unallocated ${money(r.total - r.allocated)}`}
            </Badge>
          </div>
        ))}
      </div>
    </Register>
  );
};

// --------------------------------------------------------------- Disbursements
const Disbursements = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Register
        title="Disbursements"
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add disbursement
          </Button>
        }
      >
        <div className="space-y-2 text-sm">
          {[
            { id: "D-14", type: "Counselling", payee: "Counsellor Inc.", amount: 170, status: "Paid" },
            { id: "D-15", type: "OSB levy", payee: "Superintendent", amount: 250, status: "Draft" },
          ].map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
              <span className="font-medium">{d.id}</span>
              <Badge variant="outline">{d.type}</Badge>
              <span className="text-muted-foreground">{d.payee}</span>
              <span className="ml-auto">{money(d.amount)}</span>
              <Badge variant={d.status === "Paid" ? "secondary" : "outline"}>{d.status}</Badge>
            </div>
          ))}
        </div>
      </Register>
      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add disbursement"
        sections={disbursementSections}
        submitLabel="Post"
        onSubmit={() => toast({ title: "Disbursement recorded" })}
      />
    </>
  );
};

// ------------------------------------------------------------ Payment schedules
const Schedules = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Register
        title="Payment schedules"
        description="Rows are generated from the schedule definition and tracked as Due / Received / Deposited / Outstanding."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add schedule
          </Button>
        }
      >
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-5 gap-2 text-xs uppercase text-muted-foreground">
            <span>Period</span>
            <span>Due</span>
            <span>Received</span>
            <span>Deposited</span>
            <span>Outstanding</span>
          </div>
          {[
            { p: "2026-06-01", due: 500, rec: 500, dep: 500 },
            { p: "2026-07-01", due: 500, rec: 500, dep: 500 },
            { p: "2026-08-01", due: 500, rec: 0, dep: 0 },
          ].map((r) => (
            <div key={r.p} className="grid grid-cols-5 gap-2 rounded-md border p-2">
              <span>{r.p}</span>
              <span>{money(r.due)}</span>
              <span>{money(r.rec)}</span>
              <span>{money(r.dep)}</span>
              <span className={r.due - r.rec > 0 ? "text-destructive" : ""}>{money(r.due - r.rec)}</span>
            </div>
          ))}
        </div>
      </Register>
      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add payment schedule"
        description="Schedule rows are generated automatically from these parameters."
        sections={scheduleSections}
        submitLabel="Generate schedule"
        onSubmit={() => toast({ title: "Schedule generated" })}
      />
    </>
  );
};

// -------------------------------------------------------------- Reconciliation
const Reconciliation = () => {
  const { values, onChange } = useRecordValues({ status: "Draft" });
  return (
    <div className="space-y-4">
      <Register title={`Matching — ${reconciliation.period}`} description={`${reconciliation.matched} matched · ${reconciliation.review} to review · ${reconciliation.unmatched} unmatched`}>
        <div className="space-y-2 text-sm">
          {reconciliation.rows.map((r) => (
            <div key={r.bank} className="flex items-center gap-3 rounded-md border p-3">
              <span>{r.bank}</span>
              <span className="text-muted-foreground">→ {r.match}</span>
              <Badge className="ml-auto" variant={r.state === "matched" ? "secondary" : "destructive"}>
                {r.state}
              </Badge>
            </div>
          ))}
        </div>
      </Register>
      <RecordForm
        sections={reconciliationSections}
        values={values}
        onChange={onChange}
        submitLabel="Save reconciliation"
        onSubmit={() => toast({ title: "Reconciliation saved" })}
      />
    </div>
  );
};

// ----------------------------------------------------------------- GL / journal
interface JournalLine {
  id: number;
  account: string;
  asset: string;
  creditor: string;
  debit: string;
  credit: string;
}

const GeneralLedger = () => {
  const { values, onChange } = useRecordValues({});
  const [lines, setLines] = useState<JournalLine[]>([
    { id: 1, account: glAccounts[1], asset: "", creditor: "", debit: "", credit: "" },
    { id: 2, account: glAccounts[0], asset: "", creditor: "", debit: "", credit: "" },
  ]);

  const debit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const credit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const difference = debit - credit;
  const balanced = Math.abs(difference) < 0.005 && debit > 0;

  const update = (id: number, patch: Partial<JournalLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  return (
    <div className="space-y-4">
      <RecordForm
        sections={[journalHeaderSection]}
        values={values}
        onChange={onChange}
      />
      <Register
        title="Lines"
        description="Posted entries are immutable — corrections are made with reversing or amending entries."
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setLines((p) => [...p, { id: Date.now(), account: glAccounts[0], asset: "", creditor: "", debit: "", credit: "" }])
            }
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add line
          </Button>
        }
      >
        <div className="space-y-2">
          {lines.map((l) => (
            <div key={l.id} className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
              <Select value={l.account} onValueChange={(v) => update(l.id, { account: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {glAccounts.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Asset" value={l.asset} onChange={(e) => update(l.id, { asset: e.target.value })} />
              <Input placeholder="Creditor" value={l.creditor} onChange={(e) => update(l.id, { creditor: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Debit" value={l.debit} onChange={(e) => update(l.id, { debit: e.target.value })} />
              <Input type="number" step="0.01" placeholder="Credit" value={l.credit} onChange={(e) => update(l.id, { credit: e.target.value })} />
              <Button size="icon" variant="ghost" onClick={() => setLines((p) => p.filter((x) => x.id !== l.id))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="space-y-1 border-t pt-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Debit total</span>
              <span>{money(debit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credit total</span>
              <span>{money(credit)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Difference</span>
              <span className={balanced ? "" : "text-destructive"}>{money(difference)}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => toast({ title: "Journal entry saved as draft" })}>
              Save Draft
            </Button>
            <Button
              disabled={!balanced}
              onClick={() => toast({ title: "Journal entry posted", description: "Entry is now immutable." })}
            >
              Post Entry
            </Button>
          </div>
        </div>
      </Register>
    </div>
  );
};

export const FinancialsTab = () => {
  const [tab, setTab] = useState<string>("accounts");
  return (
    <div className="space-y-4">
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "accounts" && <BankAccounts />}
      {tab === "receipts" && <Receipts />}
      {tab === "disbursements" && <Disbursements />}
      {tab === "schedules" && <Schedules />}
      {tab === "reconciliation" && <Reconciliation />}
      {tab === "gl" && <GeneralLedger />}
    </div>
  );
};
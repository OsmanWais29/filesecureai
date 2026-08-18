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
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import { reconciliation } from "@/data/estateWorkspace";
import {
  useBankAccounts,
  useDisbursements,
  useLedgerEntries,
  usePostJournalEntry,
  usePostReceipt,
  useReceipts,
  useSaveBankAccount,
  useSaveDisbursement,
  useTrustPosition,
} from "@/hooks/useEstateAccounting";

const TABS = [
  { id: "accounts", label: "Bank Accounts" },
  { id: "receipts", label: "Receipts" },
  { id: "disbursements", label: "Disbursements" },
  { id: "schedules", label: "Payment Schedules" },
  { id: "reconciliation", label: "Reconciliation" },
  { id: "gl", label: "General Ledger" },
] as const;

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Empty = ({ children }: { children: string }) => (
  <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">{children}</p>
);

// --------------------------------------------------------------- Bank accounts
const BankAccounts = ({ estateId }: { estateId?: string }) => {
  const [open, setOpen] = useState(false);
  const { data: accounts = [], isLoading } = useBankAccounts(estateId);
  const saveAccount = useSaveBankAccount(estateId);
  const trust = useTrustPosition(estateId);
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
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading accounts…
          </div>
        ) : accounts.length === 0 ? (
          <Empty>No estate bank account recorded yet.</Empty>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="rounded-md border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{a.institution ?? "Institution"}</span>
                  <Badge variant="outline">
                    {a.transit_number ?? "—"} · ••••{(a.account_number ?? "").slice(-4)}
                  </Badge>
                  {a.is_default && <Badge variant="secondary">Default</Badge>}
                  {a.pad_enabled && <Badge variant="outline">PAD</Badge>}
                  {a.eft_enabled && <Badge variant="outline">EFT</Badge>}
                  <span className="ml-auto text-muted-foreground">{a.currency}</span>
                </div>
                <div className="mt-2 grid gap-2 text-muted-foreground md:grid-cols-4">
                  <span>Opening {money(Number(a.opening_balance))}</span>
                  <span>Receipts {money(trust.received)}</span>
                  <span>Disbursements {money(trust.paid)}</span>
                  <span>Trust balance {money(Number(a.opening_balance) + trust.balance)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Register>
      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add estate bank account"
        sections={bankAccountSections}
        submitLabel="Save account"
        onSubmit={async (values) => {
          await saveAccount.mutateAsync(values);
          setOpen(false);
        }}
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

const ReceiptForm = ({ estateId, onDone }: { estateId?: string; onDone: () => void }) => {
  const { values, onChange } = useRecordValues({ receiptDate: "", amount: "" });
  const [allocations, setAllocations] = useState<Allocation[]>([
    { id: 1, account: "Surplus Income", amount: "" },
  ]);
  const { data: accounts = [] } = useBankAccounts(estateId);
  const postReceipt = usePostReceipt(estateId);

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
      onSubmit={async () => {
        if (!canPost) {
          toast({
            title: "Cannot post receipt",
            description: "Allocations must reconcile, or route the remainder to the suspense account.",
            variant: "destructive",
          });
          return;
        }
        await postReceipt.mutateAsync({
          values,
          allocations: allocations.map((a) => ({ account: a.account, amount: Number(a.amount || 0) })),
          bankAccountId: accounts.find((a) => a.is_default)?.id ?? accounts[0]?.id ?? null,
        });
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

const Receipts = ({ estateId }: { estateId?: string }) => {
  const [adding, setAdding] = useState(false);
  const { data: receipts = [], isLoading } = useReceipts(estateId);
  if (adding) return <ReceiptForm estateId={estateId} onDone={() => setAdding(false)} />;
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
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading receipts…
        </div>
      ) : receipts.length === 0 ? (
        <Empty>No receipts posted for this estate yet.</Empty>
      ) : (
        <div className="space-y-2 text-sm">
          {receipts.map((r) => {
            const total = Number(r.amount || 0);
            const allocated = (r.estate_receipt_allocations ?? []).reduce(
              (s, a) => s + Number(a.amount || 0),
              0
            );
            return (
              <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <span className="font-medium">{r.receipt_number ?? r.id.slice(0, 8)}</span>
                <span className="text-muted-foreground">{r.received_from ?? "—"}</span>
                <span className="text-muted-foreground">{r.receipt_date ?? "—"}</span>
                <span className="ml-auto">{money(total)}</span>
                <Badge variant={Math.abs(total - allocated) < 0.005 ? "secondary" : "destructive"}>
                  {Math.abs(total - allocated) < 0.005
                    ? "Allocated"
                    : `Unallocated ${money(total - allocated)}`}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </Register>
  );
};

// --------------------------------------------------------------- Disbursements
const Disbursements = ({ estateId }: { estateId?: string }) => {
  const [open, setOpen] = useState(false);
  const { data: disbursements = [], isLoading } = useDisbursements(estateId);
  const saveDisbursement = useSaveDisbursement(estateId);
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
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading disbursements…
          </div>
        ) : disbursements.length === 0 ? (
          <Empty>No disbursements recorded for this estate yet.</Empty>
        ) : (
          <div className="space-y-2 text-sm">
            {disbursements.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <span className="font-medium">{d.payee ?? "Payee"}</span>
                <Badge variant="outline">{d.disbursement_type ?? "Disbursement"}</Badge>
                <span className="text-muted-foreground">{d.payment_date ?? d.due_date ?? "—"}</span>
                <span className="ml-auto">{money(Number(d.amount))}</span>
                <Badge variant={d.cleared ? "secondary" : "outline"}>
                  {d.cleared ? "Cleared" : d.payment_date ? "Paid" : "Draft"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Register>
      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Add disbursement"
        sections={disbursementSections}
        submitLabel="Post"
        onSubmit={async (values) => {
          await saveDisbursement.mutateAsync(values);
          setOpen(false);
        }}
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

const GeneralLedger = ({ estateId }: { estateId?: string }) => {
  const { values, onChange } = useRecordValues({});
  const { data: entries = [] } = useLedgerEntries(estateId);
  const postEntry = usePostJournalEntry(estateId);
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
              disabled={!balanced || postEntry.isPending}
              onClick={async () => {
                await postEntry.mutateAsync({
                  values,
                  lines: lines.map((l) => ({
                    account: l.account,
                    asset: l.asset || undefined,
                    creditor: l.creditor || undefined,
                    debit: Number(l.debit || 0),
                    credit: Number(l.credit || 0),
                  })),
                });
                setLines([
                  { id: 1, account: glAccounts[1], asset: "", creditor: "", debit: "", credit: "" },
                  { id: 2, account: glAccounts[0], asset: "", creditor: "", debit: "", credit: "" },
                ]);
              }}
            >
              Post Entry
            </Button>
          </div>
        </div>
      </Register>

      <Register title="Posted entries" description="Immutable journal — corrections require a reversing entry.">
        {entries.length === 0 ? (
          <Empty>No journal entries posted yet.</Empty>
        ) : (
          <div className="space-y-2 text-sm">
            {entries.map((e) => (
              <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <span className="font-medium">{e.gl_date ?? e.created_at.slice(0, 10)}</span>
                <Badge variant="outline">{e.source_type}</Badge>
                <span className="text-muted-foreground">{e.memo ?? "—"}</span>
                <span className="ml-auto">{money(Number(e.total_debit))}</span>
              </div>
            ))}
          </div>
        )}
      </Register>
    </div>
  );
};

export const FinancialsTab = ({ estateId }: { estateId?: string }) => {
  const [tab, setTab] = useState<string>("accounts");
  return (
    <div className="space-y-4">
      <SubTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "accounts" && <BankAccounts estateId={estateId} />}
      {tab === "receipts" && <Receipts estateId={estateId} />}
      {tab === "disbursements" && <Disbursements estateId={estateId} />}
      {tab === "schedules" && <Schedules />}
      {tab === "reconciliation" && <Reconciliation />}
      {tab === "gl" && <GeneralLedger estateId={estateId} />}
    </div>
  );
};
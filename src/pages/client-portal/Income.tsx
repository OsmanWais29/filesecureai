import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ClientPageHeading, ClientStatusBadge, EmptyState, formatMoney } from "@/components/client-portal/primitives";
import { DocumentRequestUploader } from "@/components/client-portal/DocumentRequestUploader";
import { usePortalSession } from "@/data/clientPortal/session";
import { IncomeSubmission, usePortalIncome, usePortalIncomeActions, usePortalRequests } from "@/data/clientPortal/db";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * Monthly income and expense reporting.
 *
 * Line items follow the categories the trustee has to report on for the monthly
 * statement of income and expenses. The client reports; the surplus income
 * determination stays entirely on the trustee side.
 */
const INCOME_LINES = [
  { key: "employment", label: "Take-home pay from work" },
  { key: "self_employment", label: "Self-employment or business income" },
  { key: "pension", label: "Pension or retirement income" },
  { key: "benefits", label: "Employment insurance or social assistance" },
  { key: "child_benefits", label: "Child benefits" },
  { key: "support_received", label: "Support payments received" },
  { key: "other_income", label: "Any other income" },
];

const EXPENSE_LINES = [
  { key: "housing", label: "Rent or mortgage" },
  { key: "utilities", label: "Utilities (heat, hydro, water)" },
  { key: "food", label: "Groceries and household supplies" },
  { key: "transport", label: "Transportation (fuel, transit, car payment)" },
  { key: "insurance", label: "Insurance" },
  { key: "medical", label: "Medical, dental and prescriptions" },
  { key: "childcare", label: "Childcare" },
  { key: "support_paid", label: "Support payments made" },
  { key: "other_expenses", label: "Other living expenses" },
];

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
const monthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });

const sum = (obj: Record<string, any>) =>
  Object.values(obj ?? {}).reduce<number>((t, v) => t + (Number(v) || 0), 0);

export const ClientIncome = () => {
  const { session } = usePortalSession();
  const actor = session ? { userId: session.userId, name: session.name } : undefined;
  const { data: submissions = [], isLoading } = usePortalIncome(session?.estateId);
  const { save } = usePortalIncomeActions(session?.estateId, actor);
  const { data: requests = [] } = usePortalRequests(session?.estateId);

  const currentMonth = monthKey(new Date());
  const [period, setPeriod] = useState(currentMonth);

  const existing = submissions.find((s) => s.periodMonth?.slice(0, 10) === period);
  const locked = existing?.status === "accepted" || existing?.reviewState === "Accepted";

  const [income, setIncome] = useState<Record<string, any>>({});
  const [expenses, setExpenses] = useState<Record<string, any>>({});
  const [household, setHousehold] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState("");
  const [dirty, setDirty] = useState(false);

  const workingIncome = dirty ? income : (existing?.income ?? {});
  const workingExpenses = dirty ? expenses : (existing?.expenses ?? {});
  const workingHousehold = dirty ? household : (existing?.household ?? {});
  const workingNotes = dirty ? notes : (existing?.notes ?? "");

  const totals = useMemo(() => {
    const totalIncome = sum(workingIncome);
    const totalExpenses = sum(workingExpenses);
    return { totalIncome, totalExpenses, net: totalIncome - totalExpenses };
  }, [workingIncome, workingExpenses]);

  const touch = () => setDirty(true);
  const setLine = (
    setter: (v: Record<string, any>) => void,
    current: Record<string, any>,
    key: string,
    value: string,
  ) => {
    touch();
    setter({ ...current, [key]: value === "" ? null : Number(value) });
  };

  const persist = async (submit: boolean) => {
    const submission: IncomeSubmission = {
      estateId: session?.estateId ?? "",
      periodMonth: period,
      periodLabel: monthLabel(period),
      status: submit ? "submitted" : "draft",
      household: workingHousehold,
      income: workingIncome,
      expenses: workingExpenses,
      totals,
      notes: workingNotes,
      reviewState: "Not started",
    };
    try {
      await save.mutateAsync({ submission, submit });
      setDirty(false);
      toast.success(submit ? "Statement sent to your trustee" : "Saved as a draft");
    } catch (e) {
      toast.error("Could not save", { description: (e as Error).message });
    }
  };

  const proofRequest = requests.find(
    (r) => r.requestType === "complete_income_statement" && r.status !== "Completed" && r.status !== "Cancelled",
  );

  const months = useMemo(() => {
    const out: string[] = [];
    const d = new Date();
    for (let i = 0; i < 12; i++) {
      out.push(monthKey(new Date(d.getFullYear(), d.getMonth() - i, 1)));
    }
    return out;
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title="Income & expenses"
        description="Report what you earned and spent each month. Your trustee uses this to keep your file up to date."
      />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="period">Month</Label>
          <select
            id="period"
            className="h-11 rounded-md border bg-background px-3 text-sm"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setDirty(false);
            }}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        </div>
        {existing && <ClientStatusBadge label={existing.status === "changes_requested" ? "More Information Needed" : existing.status === "submitted" ? "Submitted" : existing.status === "accepted" ? "Accepted" : "Draft"} />}
      </div>

      {existing?.reviewNote && existing.status === "changes_requested" && (
        <p className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Your trustee asked for a change: {existing.reviewNote}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Money coming in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {INCOME_LINES.map((l) => (
              <div key={l.key} className="space-y-1.5">
                <Label htmlFor={`in-${l.key}`}>{l.label}</Label>
                <Input
                  id={`in-${l.key}`}
                  className="h-11"
                  type="number"
                  inputMode="decimal"
                  disabled={locked}
                  value={workingIncome[l.key] ?? ""}
                  onChange={(e) => setLine(setIncome, workingIncome, l.key, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Money going out</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EXPENSE_LINES.map((l) => (
              <div key={l.key} className="space-y-1.5">
                <Label htmlFor={`ex-${l.key}`}>{l.label}</Label>
                <Input
                  id={`ex-${l.key}`}
                  className="h-11"
                  type="number"
                  inputMode="decimal"
                  disabled={locked}
                  value={workingExpenses[l.key] ?? ""}
                  onChange={(e) => setLine(setExpenses, workingExpenses, l.key, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="hh-size">People in your household</Label>
              <Input
                id="hh-size"
                className="h-11"
                type="number"
                disabled={locked}
                value={workingHousehold.size ?? ""}
                onChange={(e) => {
                  touch();
                  setHousehold({ ...workingHousehold, size: e.target.value === "" ? null : Number(e.target.value) });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hh-dependants">Dependants</Label>
              <Input
                id="hh-dependants"
                className="h-11"
                type="number"
                disabled={locked}
                value={workingHousehold.dependants ?? ""}
                onChange={(e) => {
                  touch();
                  setHousehold({ ...workingHousehold, dependants: e.target.value === "" ? null : Number(e.target.value) });
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Anything your trustee should know about this month</Label>
            <Textarea
              id="notes"
              rows={3}
              disabled={locked}
              value={workingNotes}
              onChange={(e) => {
                touch();
                setNotes(e.target.value);
              }}
            />
          </div>

          <Separator />

          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Total income</dt>
              <dd className="text-lg font-semibold">{formatMoney(totals.totalIncome)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Total expenses</dt>
              <dd className="text-lg font-semibold">{formatMoney(totals.totalExpenses)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">Difference</dt>
              <dd className="text-lg font-semibold">{formatMoney(totals.net)}</dd>
            </div>
          </dl>
          <p className="text-xs text-muted-foreground">
            This is a summary of what you reported. Your trustee works out any required payment from your file — nothing is
            calculated against you here.
          </p>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="h-11" disabled={locked || save.isPending} onClick={() => void persist(false)}>
              Save as draft
            </Button>
            <Button className="h-11" disabled={locked || save.isPending} onClick={() => void persist(true)}>
              {save.isPending ? "Sending…" : "Send to my trustee"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {proofRequest && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Attach your pay stubs or proof of income</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentRequestUploader request={proofRequest} />
          </CardContent>
        </Card>
      )}

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Previous months</h2>
        {submissions.length === 0 ? (
          <EmptyState title="You haven't sent a statement yet" />
        ) : (
          <div className="space-y-2">
            {submissions.map((s) => (
              <Card key={s.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{s.periodLabel ?? monthLabel(s.periodMonth)}</p>
                    <p className="text-sm text-muted-foreground">
                      Income {formatMoney(Number(s.totals?.totalIncome ?? 0))} · Expenses{" "}
                      {formatMoney(Number(s.totals?.totalExpenses ?? 0))}
                    </p>
                  </div>
                  <ClientStatusBadge
                    label={
                      s.status === "changes_requested"
                        ? "More Information Needed"
                        : s.status === "submitted"
                          ? "Submitted"
                          : s.status === "accepted"
                            ? "Accepted"
                            : "Draft"
                    }
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientIncome;

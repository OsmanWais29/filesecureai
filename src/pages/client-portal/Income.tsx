import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useClientPortal, saveIncomePeriod, submitIncomePeriod } from "@/data/clientPortal/store";
import { ClientIncomePeriod } from "@/data/clientPortal/types";
import { ClientPageHeading, ClientStatusBadge, EmptyState, formatDate, formatMoney } from "@/components/client-portal/primitives";
import { toast } from "sonner";

const LineEditor = ({
  title,
  lines,
  onChange,
  disabled,
}: {
  title: string;
  lines: ClientIncomePeriod["income"];
  onChange: (key: string, value: number | null) => void;
  disabled: boolean;
}) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
    <div className="grid gap-3 sm:grid-cols-2">
      {lines.map((l) => (
        <div key={l.key} className="space-y-1.5">
          <Label htmlFor={l.key} className="text-sm font-normal">
            {l.label}
          </Label>
          <Input
            id={l.key}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            className="h-11"
            disabled={disabled}
            value={l.amount ?? ""}
            placeholder="0.00"
            onChange={(e) => onChange(l.key, e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      ))}
    </div>
  </div>
);

export const ClientIncome = () => {
  const state = useClientPortal();
  const periods = state.incomePeriods;
  const [activeId, setActiveId] = useState(
    periods.find((p) => p.status === "Not started" || p.status === "Draft" || p.status === "More information needed")?.id ??
      periods[0]?.id,
  );
  const active = periods.find((p) => p.id === activeId);
  const [draft, setDraft] = useState<ClientIncomePeriod | null>(active ?? null);

  const current = draft?.id === activeId ? draft : active ?? null;
  const editable = !!current && (current.status === "Not started" || current.status === "Draft" || current.status === "More information needed");

  const totals = useMemo(() => {
    const income = current?.income.reduce((s, l) => s + (l.amount ?? 0), 0) ?? 0;
    const expenses = current?.expenses.reduce((s, l) => s + (l.amount ?? 0), 0) ?? 0;
    return { income, expenses, net: income - expenses };
  }, [current]);

  if (!current) {
    return (
      <div className="mx-auto max-w-4xl">
        <ClientPageHeading title="Income & expenses" />
        <EmptyState title="No statements are due right now" />
      </div>
    );
  }

  const update = (section: "income" | "expenses", key: string, value: number | null) =>
    setDraft({
      ...current,
      status: current.status === "Not started" ? "Draft" : current.status,
      [section]: current[section].map((l) => (l.key === key ? { ...l, amount: value } : l)),
    } as ClientIncomePeriod);

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title="Income & expenses"
        description="Your monthly statement helps your trustee keep your file accurate. Enter what you actually received and paid this period."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {periods.map((p) => (
          <Button
            key={p.id}
            variant={p.id === activeId ? "default" : "outline"}
            className="h-11"
            onClick={() => {
              setActiveId(p.id);
              setDraft(p);
            }}
          >
            {p.periodLabel}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">{current.periodLabel}</CardTitle>
            <ClientStatusBadge label={current.status} />
          </div>
          <CardDescription>
            Covers {formatDate(current.periodStart)} – {formatDate(current.periodEnd)} · due {formatDate(current.dueDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {current.staffMessage && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <p className="font-medium text-destructive">Your trustee needs a correction</p>
              <p className="mt-1 text-muted-foreground">{current.staffMessage}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="household" className="text-sm font-normal">
                People in your household
              </Label>
              <Input
                id="household"
                type="number"
                min={1}
                className="h-11"
                disabled={!editable}
                value={current.householdSize ?? ""}
                onChange={(e) => setDraft({ ...current, householdSize: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dependants" className="text-sm font-normal">
                Dependants
              </Label>
              <Input
                id="dependants"
                type="number"
                min={0}
                className="h-11"
                disabled={!editable}
                value={current.dependants ?? ""}
                onChange={(e) => setDraft({ ...current, dependants: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>
          </div>

          <Separator />
          <LineEditor title="Income received" lines={current.income} onChange={(k, v) => update("income", k, v)} disabled={!editable} />
          <Separator />
          <LineEditor title="Expenses paid" lines={current.expenses} onChange={(k, v) => update("expenses", k, v)} disabled={!editable} />

          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total income</span>
              <span className="font-medium tabular-nums">{formatMoney(totals.income)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-muted-foreground">Total expenses</span>
              <span className="font-medium tabular-nums">{formatMoney(totals.expenses)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span className="font-medium">Left over this period</span>
              <span className="font-semibold tabular-nums">{formatMoney(totals.net)}</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This is a simple total of what you entered. Your trustee calculates any required payment separately using
              the official guidelines.
            </p>
          </div>

          {editable && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => {
                  saveIncomePeriod({ ...current, status: "Draft" });
                  toast.success("Saved. You can come back and finish later.");
                }}
              >
                Save draft
              </Button>
              <Button
                className="h-11"
                onClick={() => {
                  saveIncomePeriod({ ...current, status: "Draft" });
                  submitIncomePeriod(current.id);
                  toast.success("Statement submitted to your trustee");
                }}
              >
                Submit to my trustee
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientIncome;

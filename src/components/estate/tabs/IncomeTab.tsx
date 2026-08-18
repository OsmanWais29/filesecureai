import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { incomePeriodSections } from "@/data/estateFormSpecs";
import {
  computeSurplus,
  incomePeriodToValues,
  standardThreshold,
  useEstateIncomePeriods,
  useSaveIncomePeriod,
  type EstateIncomePeriodRow,
} from "@/hooks/useEstateIncome";

const money = (n: number) => `$${Number(n || 0).toLocaleString()}`;

export const IncomeTab = ({ estateId }: { estateId?: string }) => {
  const { data: periods = [], isLoading } = useEstateIncomePeriods(estateId);
  const save = useSaveIncomePeriod(estateId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<EstateIncomePeriodRow | null>(null);

  const totals = useMemo(
    () =>
      periods.reduce(
        (acc, p) => ({
          required: acc.required + p.amount_required,
          paid: acc.paid + p.payments_made,
          outstanding: acc.outstanding + p.outstanding,
        }),
        { required: 0, paid: 0, outstanding: 0 }
      ),
    [periods]
  );

  const initial = editing
    ? incomePeriodToValues(editing)
    : {
        year: new Date().getFullYear(),
        householdMembers: 1,
        standardVersion: "2026",
        statementNumber: periods.length + 1,
      };

  const preview = computeSurplus(initial as never, Number(initial.paymentsMade ?? 0));

  return (
    <Register
      title="Form 65 — monthly income & expense periods"
      description={`Household size is stored per period. Surplus is computed by the deterministic rule engine (threshold for ${
        initial.householdMembers ?? 1
      } member(s): ${money(standardThreshold(String(initial.standardVersion ?? "2026"), Number(initial.householdMembers ?? 1)))}).`}
      action={
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add statement
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-7 gap-2 text-xs uppercase text-muted-foreground">
          <span>Period</span>
          <span>Income</span>
          <span>Available</span>
          <span>Surplus</span>
          <span>Required</span>
          <span>Outstanding</span>
          <span />
        </div>
        {isLoading && <p className="text-muted-foreground">Loading statements…</p>}
        {!isLoading && periods.length === 0 && (
          <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
            No income statements recorded yet. Add the first monthly statement to start the surplus calculation.
          </p>
        )}
        {periods.map((p) => (
          <div key={p.id} className="grid grid-cols-7 items-center gap-2 rounded-md border p-2">
            <span>{p.period_label ?? `Statement ${p.statement_number ?? ""}`}</span>
            <span>{money(p.monthly_income)}</span>
            <span>{money(p.available_family_income)}</span>
            <span>{money(p.surplus_amount)}</span>
            <span>{money(p.amount_required)}</span>
            <span className={p.outstanding > 0 ? "text-destructive" : ""}>{money(p.outstanding)}</span>
            <div className="flex items-center justify-end gap-2">
              {p.disagreement && <Badge variant="destructive">Mediation</Badge>}
              <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                Edit
              </Button>
            </div>
          </div>
        ))}
        {periods.length > 0 && (
          <div className="grid grid-cols-7 gap-2 border-t pt-2 font-semibold">
            <span className="col-span-4">Totals</span>
            <span>{money(totals.required)}</span>
            <span>{money(totals.outstanding)}</span>
            <span className="text-right text-xs font-normal text-muted-foreground">
              Paid {money(totals.paid)}
            </span>
          </div>
        )}
      </div>

      <RecordDrawer
        open={adding || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setAdding(false);
            setEditing(null);
          }
        }}
        title={editing ? `${editing.period_label ?? "Statement"}` : "Add income & expense statement"}
        description={`Derived values are recalculated on save. Current preview: surplus ${money(
          preview.surplus
        )}, required ${money(preview.amountRequired)}.`}
        sections={incomePeriodSections}
        initial={initial}
        submitLabel="Save statement"
        onSubmit={(values) =>
          save.mutate(
            { values, id: editing?.id },
            {
              onSuccess: () => {
                setAdding(false);
                setEditing(null);
              },
            }
          )
        }
      />
    </Register>
  );
};

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { incomePeriodSections } from "@/data/estateFormSpecs";
import { incomePeriods } from "@/data/estateWorkspace";

export const IncomeTab = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof incomePeriods)[number] | null>(null);

  return (
    <Register
      title="Form 65 — monthly income & expense periods"
      description="Household size is stored per period. Surplus income is computed by the deterministic rule engine, not by SAFA."
      action={
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add statement
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-6 gap-2 text-xs uppercase text-muted-foreground">
          <span>Period</span>
          <span>Income</span>
          <span>Expenses</span>
          <span>Surplus</span>
          <span>Status</span>
          <span />
        </div>
        {incomePeriods.map((p) => (
          <div key={p.period} className="grid grid-cols-6 items-center gap-2 rounded-md border p-2">
            <span>{p.period}</span>
            <span>${p.income.toLocaleString()}</span>
            <span>${p.expenses.toLocaleString()}</span>
            <span>${p.surplus.toLocaleString()}</span>
            <Badge variant={p.status === "Missing" ? "destructive" : "secondary"} className="w-fit">
              {p.status}
            </Badge>
            <Button size="sm" variant="outline" className="justify-self-end" onClick={() => setEditing(p)}>
              {p.status === "Missing" ? "Enter" : "Edit"}
            </Button>
          </div>
        ))}
      </div>

      <RecordDrawer
        open={open || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setEditing(null);
          }
        }}
        title={editing ? `${editing.period} statement` : "Add income & expense statement"}
        sections={incomePeriodSections}
        initial={editing ? { monthlyIncome: editing.income, householdMembers: 4 } : {}}
        submitLabel="Save statement"
        onSubmit={() =>
          toast({ title: "Statement saved", description: "Surplus income recalculated by the rule engine." })
        }
      />
    </Register>
  );
};

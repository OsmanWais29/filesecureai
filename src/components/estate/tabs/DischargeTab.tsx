import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { RecordForm, useRecordValues } from "@/components/estate/forms/RecordForm";
import { form82Sections } from "@/data/estateFormSpecs";
import { useDischargeReport, useSaveDischargeReport } from "@/hooks/useEstateDischarge";
import { useEstateIncomePeriods } from "@/hooks/useEstateIncome";
import { useCounsellingSessions } from "@/hooks/useEstateStatutory";

export const DischargeTab = ({ estateId }: { estateId?: string }) => {
  const { data: report, isLoading } = useDischargeReport(estateId);
  const { data: periods = [] } = useEstateIncomePeriods(estateId);
  const { data: sessions = [] } = useCounsellingSessions(estateId);
  const save = useSaveDischargeReport(estateId);
  const { values, setValues, onChange } = useRecordValues({});

  // Derived statutory values come from the estate database, never from free text.
  const derived = {
    incomeAtBankruptcy: periods[0]?.monthly_income ?? 0,
    incomeAtReportDate: periods[periods.length - 1]?.monthly_income ?? 0,
    familyIncome:
      (periods[periods.length - 1]?.bankrupt_income ?? 0) +
      (periods[periods.length - 1]?.spouse_income ?? 0) +
      (periods[periods.length - 1]?.other_family_income ?? 0),
    surplusRequired: periods.reduce((s, p) => s + Number(p.amount_required || 0), 0),
    amountAgreed: periods.reduce((s, p) => s + Number(p.amount_agreed || 0), 0),
    counsellingCompleted: sessions.filter((s) => s.completed).length >= 2,
  };

  useEffect(() => {
    if (isLoading) return;
    setValues({ ...(report?.report_data ?? {}), ...derived });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, report?.id, JSON.stringify(derived)]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">Form 82 / s.170 report</span>
        <Badge variant={report?.generated_at ? "secondary" : "outline"}>
          {report?.generated_at ? "Generated" : report ? "Draft" : "Not started"}
        </Badge>
        {report?.opposition && <Badge variant="destructive">Opposition recorded</Badge>}
        <span className="ml-auto text-xs text-muted-foreground">
          Financial figures are derived from Form 65 periods and counselling records.
        </span>
      </div>
      <RecordForm
        sections={form82Sections}
        values={values}
        onChange={onChange}
        submitLabel="Save s.170 report"
        secondaryLabel="Generate Form 82"
        onSecondary={() => save.mutate({ values, existing: report, generate: true })}
        onSubmit={() => save.mutate({ values, existing: report })}
      />
    </div>
  );
};

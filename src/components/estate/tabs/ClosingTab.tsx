import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { RecordForm, useRecordValues } from "@/components/estate/forms/RecordForm";
import { closingSections } from "@/data/estateFormSpecs";
import { useEstateClosing, useSaveClosing } from "@/hooks/useEstateDischarge";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";
import { useTrustPosition } from "@/hooks/useEstateAccounting";

const CHECKS = closingSections
  .flatMap((s) => s.fields)
  .filter((f) => f.type === "checkbox")
  .map((f) => f.key);

export const ClosingTab = ({ estateId }: { estateId?: string }) => {
  const { data: closing, isLoading } = useEstateClosing(estateId);
  const { rules } = useEstateCompliance(estateId);
  const trust = useTrustPosition(estateId);
  const save = useSaveClosing(estateId);
  const { values, setValues, onChange } = useRecordValues({});

  useEffect(() => {
    if (!isLoading) setValues((closing?.checklist ?? {}) as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, closing?.id]);

  const done = CHECKS.filter((k) => Boolean(values[k])).length;
  const failing = rules.filter((r) => r.state === "fail");
  const balanceClear = Math.abs(trust.balance ?? 0) < 0.005;
  const ready = CHECKS.length > 0 && done === CHECKS.length && failing.length === 0 && balanceClear;

  const attemptClose = () => {
    if (!ready) {
      toast({
        title: "Closing blocked",
        description: !balanceClear
          ? "The trust balance must be reduced to zero before the estate can be closed."
          : failing.length
            ? `Unmet compliance rules: ${failing.map((r) => r.rule).join(" · ")}`
            : "All closing conditions must be satisfied before the estate can be closed.",
        variant: "destructive",
      });
      return;
    }
    save.mutate({ values, existing: closing, close: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm">
        <span className="font-medium">Closing status</span>
        <Badge variant={closing?.closed ? "secondary" : ready ? "secondary" : "destructive"}>
          {closing?.closed ? "Closed" : ready ? "Ready" : "Blocked"}
        </Badge>
        <Badge variant={balanceClear ? "outline" : "destructive"}>
          Trust balance {(trust.balance ?? 0).toLocaleString(undefined, { style: "currency", currency: "CAD" })}
        </Badge>
        <span className="ml-auto text-muted-foreground">
          {done} of {CHECKS.length} closing conditions · {failing.length} failing compliance rules
        </span>
      </div>

      <RecordForm
        sections={closingSections}
        values={values}
        onChange={onChange}
        submitLabel="Close estate"
        secondaryLabel="Save"
        onSecondary={() => save.mutate({ values, existing: closing })}
        onSubmit={attemptClose}
      />
    </div>
  );
};

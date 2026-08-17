import { toast } from "@/hooks/use-toast";
import { RecordForm, useRecordValues } from "@/components/estate/forms/RecordForm";
import { form82Sections } from "@/data/estateFormSpecs";

export const DischargeTab = () => {
  const { values, onChange } = useRecordValues({});

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Form 82 / section 170 is a structured interview. Derived values are populated from the estate
        database; only judgement fields require trustee input.
      </p>
      <RecordForm
        sections={form82Sections}
        values={values}
        onChange={onChange}
        submitLabel="Save s.170 report"
        secondaryLabel="Generate Form 82"
        onSecondary={() => toast({ title: "Form 82 generated from structured data" })}
        onSubmit={() => toast({ title: "s.170 report saved" })}
      />
    </div>
  );
};

import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { RecordForm, useRecordValues } from "@/components/estate/forms/RecordForm";
import { closingSections } from "@/data/estateFormSpecs";

const CHECKS = closingSections
  .flatMap((s) => s.fields)
  .filter((f) => f.type === "checkbox")
  .map((f) => f.key);

export const ClosingTab = () => {
  const { values, onChange } = useRecordValues({});
  const done = CHECKS.filter((k) => Boolean(values[k])).length;
  const ready = CHECKS.length > 0 && done === CHECKS.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-md border p-3 text-sm">
        <span className="font-medium">Closing status</span>
        <Badge variant={ready ? "secondary" : "destructive"}>{ready ? "Ready" : "Blocked"}</Badge>
        <span className="ml-auto text-muted-foreground">
          {done} of {CHECKS.length} closing conditions satisfied
        </span>
      </div>

      <RecordForm
        sections={closingSections}
        values={values}
        onChange={onChange}
        submitLabel="Close estate"
        secondaryLabel="Save"
        onSecondary={() => toast({ title: "Closing record saved" })}
        onSubmit={() =>
          ready
            ? toast({ title: "Estate closed", description: "Closing recorded in the audit trail." })
            : toast({
                title: "Closing blocked",
                description: "All closing conditions must be satisfied before the estate can be closed.",
                variant: "destructive",
              })
        }
      />
    </div>
  );
};

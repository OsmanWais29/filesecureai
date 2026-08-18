import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { formParameterSections } from "@/data/estateFormSpecs";
import {
  FormCatalogueItem,
  formToValues,
  useEstateForms,
  useSaveFormInstance,
} from "@/hooks/useEstateForms";

export const FormsTab = ({ estateId }: { estateId?: string }) => {
  const [active, setActive] = useState<FormCatalogueItem | null>(null);
  const { items, isLoading } = useEstateForms(estateId);
  const save = useSaveFormInstance(estateId);

  return (
    <Register
      title="Forms catalogue"
      description="Generation is gated by the deterministic compliance engine; every action is written to the estate audit log."
    >
      <div className="space-y-2 text-sm">
        {isLoading && <p className="text-muted-foreground">Loading forms…</p>}
        {items.map((f) => (
          <div key={f.number} className="rounded-md border p-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium">{f.number}</span>
              <span className="text-muted-foreground">{f.title}</span>
              <Badge variant="outline">{f.status}</Badge>
              <Badge variant={f.validation === "Passed" ? "secondary" : "destructive"}>
                {f.validation}
              </Badge>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setActive(f)} disabled={!estateId}>
                  Parameters
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!estateId || !f.instance?.generated_at || Boolean(f.instance?.filed_at)}
                  onClick={() =>
                    save.mutate({ item: f, values: formToValues(f), generate: true, file: true })
                  }
                >
                  Mark filed
                </Button>
              </div>
            </div>
            {f.blockers.length > 0 && (
              <p className="mt-2 text-xs text-destructive">Blocked by: {f.blockers.join(" · ")}</p>
            )}
          </div>
        ))}
      </div>

      <RecordDrawer
        open={Boolean(active)}
        onOpenChange={(o) => !o && setActive(null)}
        title={`${active?.number ?? ""} parameters`}
        sections={formParameterSections}
        initial={active ? formToValues(active) : {}}
        submitLabel={active?.blockers.length ? "Save parameters" : "Generate form"}
        extra={
          active?.blockers.length
            ? `Generation blocked: ${active.blockers.join(" · ")}`
            : "Generating writes the form instance and an audit event."
        }
        onSubmit={(values) => {
          if (!active) return;
          save.mutate({ item: active, values, generate: active.blockers.length === 0 });
        }}
      />
    </Register>
  );
};

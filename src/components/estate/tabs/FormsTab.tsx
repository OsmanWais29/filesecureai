import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { formParameterSections } from "@/data/estateFormSpecs";
import { forms } from "@/data/estateWorkspace";

export const FormsTab = () => {
  const [active, setActive] = useState<(typeof forms)[number] | null>(null);

  return (
    <Register
      title="Forms catalogue"
      description="Each form exposes its own parameter drawer before generation or e-filing."
    >
      <div className="space-y-2 text-sm">
        {forms.map((f) => (
          <div key={f.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
            <span className="font-medium">{f.number}</span>
            <span className="text-muted-foreground">{f.title}</span>
            <Badge variant="outline">{f.status}</Badge>
            <Badge variant={f.validation === "Passed" ? "secondary" : "destructive"}>{f.validation}</Badge>
            <Button size="sm" variant="outline" className="ml-auto" onClick={() => setActive(f)}>
              Parameters
            </Button>
          </div>
        ))}
      </div>

      <RecordDrawer
        open={Boolean(active)}
        onOpenChange={(o) => !o && setActive(null)}
        title={`${active?.number ?? ""} parameters`}
        sections={formParameterSections}
        initial={{ eFile: true }}
        submitLabel="Generate form"
        onSubmit={() => toast({ title: "Form generated" })}
      />
    </Register>
  );
};

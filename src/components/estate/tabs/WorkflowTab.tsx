import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { workflow } from "@/data/estateWorkspace";

export const WorkflowTab = () => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {workflow.map((stage) => (
      <Card key={stage.name}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            {stage.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stage.steps.map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-sm">
              {s.state === "done" && <CheckCircle2 className="h-4 w-4 text-primary" />}
              {s.state === "current" && <CircleDot className="h-4 w-4 text-foreground" />}
              {s.state === "pending" && <Circle className="h-4 w-4 text-muted-foreground/50" />}
              <span className={s.state === "pending" ? "text-muted-foreground" : ""}>{s.label}</span>
              {s.note && <span className="ml-auto text-xs text-muted-foreground">{s.note}</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);

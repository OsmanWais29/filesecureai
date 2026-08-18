import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, Circle, CircleDot, Loader2 } from "lucide-react";
import { MILESTONE_STAGES } from "@/data/estateMilestoneTemplate";
import { Milestone, useEstateMilestones, useSaveMilestone } from "@/hooks/useEstateMilestones";

const stateIcon = (state: Milestone["state"]) => {
  if (state === "complete") return <CheckCircle2 className="h-4 w-4 text-primary" />;
  if (state === "overdue") return <AlertTriangle className="h-4 w-4 text-destructive" />;
  if (state === "due") return <CircleDot className="h-4 w-4 text-foreground" />;
  return <Circle className="h-4 w-4 text-muted-foreground/50" />;
};

export const WorkflowTab = ({ estateId }: { estateId?: string }) => {
  const { milestones, blockers, completed, total, progress, isLoading } = useEstateMilestones(estateId);
  const save = useSaveMilestone(estateId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading milestones…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Milestone progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">
            {completed} of {total} milestones complete
            {blockers.length > 0 && ` · ${blockers.length} blocking item${blockers.length === 1 ? "" : "s"} outstanding`}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MILESTONE_STAGES.map((stage) => (
          <Card key={stage}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                {stage}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones
                .filter((m) => m.stage === stage)
                .map((m) => (
                  <div key={m.code} className="space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      {stateIcon(m.state)}
                      <span className={m.state === "pending" ? "text-muted-foreground" : ""}>{m.label}</span>
                      {m.blocking && m.state !== "complete" && (
                        <Badge variant="destructive" className="ml-auto">
                          Blocking
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pl-6 text-xs text-muted-foreground">
                      <span>
                        {m.completedDate
                          ? `Completed ${m.completedDate}`
                          : m.dueDate
                            ? `Due ${m.dueDate}`
                            : m.anchorMissing
                              ? `Awaiting ${m.anchorDateType}`
                              : "No due date"}
                      </span>
                      {m.statutoryReference && <span>· {m.statutoryReference}</span>}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-6 px-2"
                        disabled={save.isPending}
                        onClick={() =>
                          save.mutate({
                            milestone: m,
                            completedDate:
                              m.state === "complete" ? null : new Date().toISOString().slice(0, 10),
                          })
                        }
                      >
                        {m.state === "complete" ? "Reopen" : "Complete"}
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

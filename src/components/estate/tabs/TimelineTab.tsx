import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { timeline, TimelineEvent } from "@/data/estateWorkspace";

export const TimelineTab = () => {
  const [selected, setSelected] = useState<TimelineEvent>(timeline[2]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Estate Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-4 border-l pl-6">
            {timeline.map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => setSelected(e)}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted",
                    selected.id === e.id && "bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-background",
                      e.state === "done" && "bg-primary",
                      e.state === "current" && "bg-foreground",
                      e.state === "pending" && "bg-muted-foreground/40"
                    )}
                  />
                  <div className="text-sm font-medium">{e.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.date}
                    {e.state === "current" && " · current"}
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{selected.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Date</p>
            <p>{selected.date}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Source</p>
            <p>{selected.source ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Entered by</p>
            <p>{selected.enteredBy ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Confirmed by</p>
            <p>{selected.confirmedBy ?? "Not confirmed"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Rule dependencies</p>
            {selected.dependencies?.length ? (
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                {selected.dependencies.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">None</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

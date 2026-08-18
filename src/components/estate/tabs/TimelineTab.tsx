import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEstateDates } from "@/hooks/useEstateRecords";
import { useEstateMilestones } from "@/hooks/useEstateMilestones";

interface TimelineEntry {
  id: string;
  label: string;
  date: string;
  state: "done" | "current" | "pending";
  source?: string;
  enteredBy?: string;
  confirmedBy?: string;
  dependencies?: string[];
}

export const TimelineTab = ({ estateId }: { estateId?: string }) => {
  const { data: dates = [], isLoading } = useEstateDates(estateId);
  const { milestones } = useEstateMilestones(estateId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const timeline = useMemo<TimelineEntry[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return dates
      .filter((d) => d.date_value)
      .sort((a, b) => String(a.date_value).localeCompare(String(b.date_value)))
      .map((d) => ({
        id: d.id,
        label: d.date_type,
        date: String(d.date_value),
        state: String(d.date_value) < today ? "done" : "pending",
        source: d.source_type ?? undefined,
        enteredBy: d.entered_by ?? undefined,
        confirmedBy: d.confirmed_by ?? undefined,
        dependencies: milestones
          .filter((m) => m.anchorDateType === d.date_type)
          .map((m) => `${m.label}${m.offsetDays != null ? ` (anchor ${m.offsetDays >= 0 ? "+" : ""}${m.offsetDays}d)` : ""}`),
      }));
  }, [dates, milestones]);

  const selected = timeline.find((e) => e.id === selectedId) ?? timeline[0] ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading timeline…
      </div>
    );
  }

  if (!timeline.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No dates recorded yet. Add dates in the Estate Record → Significant Dates register and they will
        appear here with their provenance and dependent milestones.
      </p>
    );
  }

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
                  onClick={() => setSelectedId(e.id)}
                  className={cn(
                    "w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted",
                    selected?.id === e.id && "bg-muted"
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
          <CardTitle className="text-base">{selected?.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Date</p>
            <p>{selected?.date}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Source</p>
            <p>{selected?.source ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Entered by</p>
            <p>{selected?.enteredBy ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Confirmed by</p>
            <p>{selected?.confirmedBy ?? "Not confirmed"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Dependent milestones</p>
            {selected?.dependencies?.length ? (
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

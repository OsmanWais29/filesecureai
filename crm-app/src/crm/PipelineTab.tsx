// Pipeline: every file as a card, in a column per stage. Arrows move a file between stages.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STAGES, daysAgo, money } from "./data";
import { useCRM } from "./store";
import { Pill, STAGE_STYLE } from "./ui";

export const PipelineTab = ({ openClient }: { openClient: (id: string) => void }) => {
  const { clients, shiftStage } = useCRM();

  return (
    // Columns scroll sideways on small screens
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[1100px] grid-cols-6 gap-3">
        {STAGES.map((stage, i) => {
          const files = clients.filter((c) => c.stage === stage);
          const debt = files.reduce((sum, c) => sum + c.totalDebt, 0);
          return (
            <section key={stage} className="flex flex-col gap-2 rounded-xl bg-muted/40 p-2">
              {/* Column header: stage, count, total debt */}
              <header className="px-1 pt-1">
                <div className="flex items-center justify-between">
                  <Pill className={STAGE_STYLE[stage]}>{stage}</Pill>
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">{files.length}</span>
                </div>
                <p className="mt-1 text-xs tabular-nums text-muted-foreground">{debt ? money(debt) : "—"}</p>
              </header>

              {/* File cards */}
              {files.map((c) => {
                const stale = daysAgo(c.lastActivity) > 14;
                return (
                  <Card key={c.id} className="p-3">
                    <button onClick={() => openClient(c.id)} className="block w-full text-left">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.fileType}</p>
                      <p className="mt-2 text-xs tabular-nums">{c.totalDebt ? money(c.totalDebt) : "Debt not assessed"}</p>
                      <p className={cn("text-xs", stale ? "font-medium text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                        {daysAgo(c.stageSince)}d in stage{stale && " · no contact"}
                      </p>
                    </button>
                    {/* Move left / right */}
                    <div className="mt-2 flex justify-between border-t pt-2">
                      <button aria-label="Move back" disabled={i === 0} onClick={() => shiftStage(c, -1)} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                      <button aria-label="Move forward" disabled={i === STAGES.length - 1} onClick={() => shiftStage(c, 1)} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </Card>
                );
              })}
              {files.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">No files</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
};

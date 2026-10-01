// Dashboard: today's appointments, upcoming deadlines, files needing attention, recent activity.
import { format, isToday } from "date-fns";
import { AlertTriangle, CalendarClock, CalendarDays, History, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REQUIRED_DOCS, daysAgo, isLate } from "./data";
import { useCRM } from "./store";
import { DraftCard } from "./DraftCard";
import { ActivityRow, Empty, Panel, Pill } from "./ui";

export const DashboardTab = ({ openClient }: { openClient: (id: string) => void }) => {
  const { clients, appointments, openDeadlines, activities, nameOf, drafts } = useCRM();

  const today = appointments.filter((a) => isToday(new Date(a.date)));
  const soon = openDeadlines.filter((d) => daysAgo(d.due) > -14); // due within 14 days (overdue included)

  // One row per open file that needs action, with every reason joined
  const attention = clients.filter((c) => c.stage !== "Discharged").map((c) => ({
    c,
    why: [
      c.stage === "New lead" && daysAgo(c.createdAt) >= 1 && `New lead waiting ${daysAgo(c.createdAt)} days for a call back`,
      daysAgo(c.lastActivity) > 14 && `No contact in ${daysAgo(c.lastActivity)} days`,
      (c.stage === "Assessment" || c.stage === "Filed") && c.docsReceived.length < REQUIRED_DOCS.length && `${REQUIRED_DOCS.length - c.docsReceived.length} document(s) missing`,
    ].filter(Boolean).join(" · "),
  })).filter((x) => x.why);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Emails the AI drafted, waiting for a person to approve */}
      {!!drafts.length && (
        <Panel icon={Mail} title={`Drafts awaiting approval (${drafts.length})`} className="lg:col-span-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{drafts.map((d) => <DraftCard key={d.id} id={d.id} />)}</div>
        </Panel>
      )}
      <Panel icon={CalendarDays} title={`Today · ${format(new Date(), "EEE, MMM d")}`}>
        {!today.length && <Empty icon={CalendarDays} text="No appointments today" />}
        <div className="space-y-2">
          {today.map((a) => (
            <button key={a.id} onClick={() => a.clientId && openClient(a.clientId)} className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/40">
              <span className="w-20 whitespace-nowrap text-sm font-medium tabular-nums">{a.time}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{a.title}</span><span className="text-xs text-muted-foreground">{a.client}</span></span>
              {a.source !== "CRM" && <Pill className="bg-muted text-muted-foreground">{a.source}</Pill>}
            </button>
          ))}
        </div>
      </Panel>

      <Panel icon={CalendarClock} title="Deadlines · next 14 days">
        {!soon.length && <Empty icon={CalendarClock} text="Nothing due" />}
        <div className="space-y-2">
          {soon.map((d) => (
            <button key={d.id} onClick={() => openClient(d.clientId)} className="flex w-full gap-3 text-left text-sm">
              <span className={cn("w-14 shrink-0 text-xs font-medium tabular-nums", isLate(d) ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                {isLate(d) ? "Overdue" : format(new Date(d.due), "MMM d")}
              </span>
              <span>{d.title}<span className="block text-xs text-muted-foreground">{nameOf(d.clientId)}{d.statutory && " · BIA"}</span></span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel icon={AlertTriangle} title="Needs attention">
        {!attention.length && <Empty icon={AlertTriangle} text="All files are on track" />}
        <div className="space-y-2">
          {attention.map(({ c, why }) => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
              <span><span className="font-medium">{c.name}</span><span className="block text-xs text-muted-foreground">{why}</span></span>
              <Button size="sm" variant="ghost" onClick={() => openClient(c.id)}>Open</Button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel icon={History} title="Recent activity" className="lg:col-span-3" right={<span className="text-xs text-muted-foreground">Includes website and calendar syncs</span>}>
        <div className="grid gap-3 md:grid-cols-2">
          {activities.slice(0, 8).map((a) => (
            <button key={a.id} onClick={() => openClient(a.clientId)}><ActivityRow a={a} who={nameOf(a.clientId)} /></button>
          ))}
        </div>
      </Panel>
    </div>
  );
};

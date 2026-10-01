// Dashboard: what the trustee needs today — appointments, deadlines, files needing attention, new activity.
import { format, formatDistanceToNow, isToday } from "date-fns";
import { AlertTriangle, CalendarClock, CalendarDays, History, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REQUIRED_DOCS, daysAgo } from "./data";
import { useCRM } from "./store";
import { ACTIVITY_ICON, Empty, Pill, SectionTitle } from "./ui";

export const DashboardTab = ({ openClient }: { openClient: (id: string) => void }) => {
  const { clients, appointments, deadlines, activities } = useCRM();
  const nameOf = (id?: string) => clients.find((c) => c.id === id)?.name ?? "";

  // Today's appointments, by time
  const today = appointments.filter((a) => isToday(new Date(a.date)));

  // Open deadlines due in the next 14 days (overdue first)
  const soon = deadlines
    .filter((d) => !d.done && daysAgo(d.due) > -14)
    .sort((a, b) => a.due.localeCompare(b.due));

  // Files needing attention: uncontacted new leads, stalled files, missing documents
  const attention = clients.flatMap((c) => {
    if (c.stage === "Discharged") return [];
    const out: string[] = [];
    if (c.stage === "New lead" && daysAgo(c.createdAt) >= 1) out.push(`New lead waiting ${daysAgo(c.createdAt)} days for a call back`);
    if (daysAgo(c.lastActivity) > 14) out.push(`No contact in ${daysAgo(c.lastActivity)} days`);
    const missing = REQUIRED_DOCS.length - c.docsReceived.length;
    if (["Assessment", "Filed"].includes(c.stage) && missing) out.push(`${missing} document(s) missing`);
    return out.length ? [{ client: c, text: out.join(" · ") }] : []; // one row per client
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Today's schedule */}
      <Card className="p-5">
        <SectionTitle icon={CalendarDays}>Today · {format(new Date(), "EEE, MMM d")}</SectionTitle>
        {today.length === 0 && <Empty icon={CalendarDays} text="No appointments today" />}
        <ul className="space-y-2">
          {today.map((a) => (
            <li key={a.id}>
              <button onClick={() => a.clientId && openClient(a.clientId)} className="flex w-full items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/40">
                <span className="w-20 whitespace-nowrap text-sm font-medium tabular-nums">{a.time}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.client}</p>
                </div>
                {a.source !== "CRM" && <Pill className="bg-muted text-muted-foreground">{a.source}</Pill>}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Deadlines */}
      <Card className="p-5">
        <SectionTitle icon={CalendarClock}>Deadlines · next 14 days</SectionTitle>
        {soon.length === 0 && <Empty icon={CalendarClock} text="Nothing due" />}
        <ul className="space-y-2">
          {soon.map((d) => {
            const late = daysAgo(d.due) > 0;
            return (
              <li key={d.id}>
                <button onClick={() => openClient(d.clientId)} className="flex w-full items-start gap-3 text-left text-sm">
                  <span className={cn("w-14 shrink-0 text-xs font-medium tabular-nums", late ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                    {late ? "Overdue" : format(new Date(d.due), "MMM d")}
                  </span>
                  <span className="flex-1">
                    {d.title}
                    <span className="block text-xs text-muted-foreground">{nameOf(d.clientId)}{d.statutory && " · BIA"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Needs attention */}
      <Card className="p-5">
        <SectionTitle icon={AlertTriangle}>Needs attention</SectionTitle>
        {attention.length === 0 && <Empty icon={AlertTriangle} text="All files are on track" />}
        <ul className="space-y-2">
          {attention.map(({ client, text }) => (
            <li key={client.id} className="flex items-center justify-between gap-2 rounded-lg bg-amber-500/10 p-3 text-sm">
              <span><span className="font-medium">{client.name}</span><span className="block text-xs text-muted-foreground">{text}</span></span>
              <Button size="sm" variant="ghost" onClick={() => openClient(client.id)}>Open</Button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Recent activity across all clients (includes website + calendar syncs) */}
      <Card className="p-5 lg:col-span-3">
        <SectionTitle icon={History} right={<span className="flex items-center gap-1 text-xs text-muted-foreground"><Inbox className="h-3.5 w-3.5" />Includes website and calendar syncs</span>}>
          Recent activity
        </SectionTitle>
        <ul className="grid gap-3 md:grid-cols-2">
          {activities.slice(0, 8).map((a) => {
            const Icon = ACTIVITY_ICON[a.type];
            return (
              <li key={a.id}>
                <button onClick={() => openClient(a.clientId)} className="flex w-full gap-3 text-left">
                  <div className="h-fit rounded-full bg-muted p-2"><Icon className="h-3.5 w-3.5" /></div>
                  <div className="min-w-0">
                    <p className="text-sm"><span className="font-medium">{nameOf(a.clientId)}</span> · {a.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.at), { addSuffix: true })}{a.source && ` · ${a.source}`}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};

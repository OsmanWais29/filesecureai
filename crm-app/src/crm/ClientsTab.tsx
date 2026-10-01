// Clients tab: searchable client list on the left, selected client's profile on the right.
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, Mail, Phone, Building2, UserCheck, Activity as ActivityIcon, Sparkles, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ACTIVITIES, Client } from "./data";
import { ACTIVITY_ICON, Empty, LEVEL_STYLE, Pill, SectionTitle, initials } from "./ui";

const STATUSES = ["all", "active", "lead", "inactive"] as const; // filter chips
const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

export const ClientsTab = ({ clients }: { clients: Client[] }) => {
  const [query, setQuery] = useState(""); // search text
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all"); // status filter
  const [selectedId, setSelectedId] = useState(clients[0]?.id); // selected client

  // Apply search + status filter
  const visible = clients.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  const selected = clients.find((c) => c.id === selectedId) ?? visible[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      {/* ---- Left: client list ---- */}
      <Card className="flex flex-col overflow-hidden">
        <div className="space-y-3 border-b p-4">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search clients..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
          </div>
          {/* Status filter chips */}
          <div className="flex gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs capitalize transition-colors",
                  status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Client rows */}
        <div className="max-h-[560px] flex-1 overflow-y-auto p-2">
          {visible.length === 0 && <Empty icon={Users} text="No clients match your search" />}
          {visible.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/60",
                selected?.id === c.id && "bg-primary/5 ring-1 ring-primary/20",
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(c.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.company || c.email}</p>
              </div>
              <Pill className={LEVEL_STYLE[c.risk]}>{c.risk}</Pill>
            </button>
          ))}
        </div>
      </Card>

      {/* ---- Right: profile of the selected client ---- */}
      {selected ? <ClientProfile client={selected} /> : <Card><Empty icon={Users} text="Select a client" /></Card>}
    </div>
  );
};

// Full profile card for one client
const ClientProfile = ({ client: c }: { client: Client }) => {
  const activities = ACTIVITIES.filter((a) => a.clientId === c.id); // this client's history
  const idle = daysSince(c.lastActivity); // days without contact

  // Simple rule-based recommendations (no AI call needed)
  const tips = [
    idle > 14 && `No contact in ${idle} days — schedule a follow-up.`,
    c.risk === "high" && "High risk — review the file and book a check-in.",
    c.progress < 30 && "Case is early — request outstanding documents.",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header: avatar, name, status, contact info */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">{initials(c.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{c.name}</h2>
              <Pill className="bg-primary/10 text-primary">{c.status}</Pill>
              <Pill className={LEVEL_STYLE[c.risk]}>{c.risk} risk</Pill>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              {c.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{c.email}</span>}
              {c.phone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{c.phone}</span>}
              {c.company && <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />{c.company}</span>}
              <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5" />{c.assignedTo}</span>
            </div>
            {/* Tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.tags.map((t) => <Pill key={t} className="bg-muted text-muted-foreground normal-case">{t}</Pill>)}
            </div>
          </div>
        </div>

        {/* Health + progress bars */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Meter label="Account health" value={c.health} />
          <Meter label="Case progress" value={c.progress} />
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent activity list */}
        <Card className="p-5">
          <SectionTitle icon={ActivityIcon}>Recent activity</SectionTitle>
          {activities.length === 0 && <Empty icon={ActivityIcon} text="No activity yet" />}
          <ul className="space-y-3">
            {activities.map((a) => {
              const Icon = ACTIVITY_ICON[a.type];
              return (
                <li key={a.id} className="flex gap-3">
                  <div className="rounded-full bg-muted p-2"><Icon className="h-3.5 w-3.5" /></div>
                  <div>
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.at), { addSuffix: true })}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Recommendations */}
        <Card className="p-5">
          <SectionTitle icon={Sparkles}>Recommendations</SectionTitle>
          {tips.length === 0 && <Empty icon={Sparkles} text="All good — nothing needs attention" />}
          <ul className="space-y-2">
            {tips.map((t) => (
              <li key={t} className="rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-3 text-sm">{t}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

// Labelled progress bar
const Meter = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="mb-1.5 flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}%</span>
    </div>
    <Progress value={value} className="h-2" />
  </div>
);

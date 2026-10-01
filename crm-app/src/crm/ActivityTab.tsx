// Activity tab: one timeline of every client interaction, filterable by type.
import { useState } from "react";
import { format } from "date-fns";
import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACTIVITIES, Activity, Client } from "./data";
import { ACTIVITY_ICON, Empty, Pill } from "./ui";

const TYPES = ["all", "email", "call", "meeting", "note", "form"] as const; // filter chips

export const ActivityTab = ({ clients }: { clients: Client[] }) => {
  const [type, setType] = useState<(typeof TYPES)[number]>("all");

  // Look up the client for an activity
  const clientOf = (a: Activity) => clients.find((c) => c.id === a.clientId);

  // Newest first, only known clients, filtered by type
  const items = [...ACTIVITIES]
    .sort((a, b) => b.at.localeCompare(a.at))
    .filter((a) => clientOf(a) && (type === "all" || a.type === type));

  return (
    <Card className="p-6">
      {/* Type filter */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              "rounded-full px-3 py-1 text-xs capitalize transition-colors",
              type === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {items.length === 0 && <Empty icon={History} text="No activity of this type" />}

      {/* Vertical timeline: a line on the left with an icon dot per event */}
      <ol className="relative ml-4 border-l">
        {items.map((a) => {
          const Icon = ACTIVITY_ICON[a.type];
          return (
            <li key={a.id} className="mb-6 ml-6 last:mb-0">
              <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border bg-background">
                <Icon className="h-3.5 w-3.5 text-primary" />
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{a.text}</p>
                <Pill className="bg-muted text-muted-foreground">{a.type}</Pill>
              </div>
              <p className="text-xs text-muted-foreground">
                {clientOf(a)?.name} · {format(new Date(a.at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};

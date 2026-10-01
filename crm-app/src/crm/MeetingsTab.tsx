// Meetings tab: upcoming meetings (Supabase or demo data) with join / copy / email actions.
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Copy, ExternalLink, Mail, MapPin, Phone, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Meeting, MEETINGS } from "./data";
import { Empty, Pill } from "./ui";

// Icon per meeting type
const TYPE_ICON = { video: Video, phone: Phone, in_person: MapPin } as const;

// Plain-text summary used for copy + email
const summary = (m: Meeting) =>
  [m.title, format(new Date(m.start_time), "PPpp"), m.meeting_url && `Join: ${m.meeting_url}`, m.description]
    .filter(Boolean)
    .join("\n");

// Load meetings from the `meetings` table, or demo meetings without Supabase
const useMeetings = () =>
  useQuery({
    queryKey: ["crm-meetings"],
    queryFn: async (): Promise<Meeting[]> => {
      if (!supabase) return MEETINGS; // demo mode
      const { data, error } = await supabase.from("meetings").select("*").order("start_time");
      if (error) throw error;
      return data;
    },
  });

export const MeetingsTab = () => {
  const { data: meetings = [], isLoading, isError } = useMeetings();

  // Only meetings that are still upcoming or running
  const active = meetings.filter((m) => m.status === "scheduled" || m.status === "in_progress");

  if (isLoading) return <Card className="p-10 text-center text-sm text-muted-foreground">Loading meetings…</Card>;
  if (isError) return <Card className="p-10 text-center text-sm text-destructive">Could not load meetings.</Card>;
  if (!active.length) return <Card><Empty icon={Calendar} text="No upcoming meetings" /></Card>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {active.map((m) => {
        const Icon = TYPE_ICON[m.meeting_type as keyof typeof TYPE_ICON] ?? Video;
        return (
          <Card key={m.id} className="p-5">
            {/* Title row */}
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.title}</p>
                <p className="text-xs text-muted-foreground">
                  {m.client_name ?? "Client"} · {format(new Date(m.start_time), "EEE, MMM d · h:mm a")}
                </p>
              </div>
              <Pill className="bg-primary/10 text-primary">{m.status.replace("_", " ")}</Pill>
            </div>

            {m.description && <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" disabled={!m.meeting_url} onClick={() => window.open(m.meeting_url, "_blank")}>
                <ExternalLink className="mr-1.5 h-4 w-4" />Join
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(summary(m)).then(() => toast.success("Details copied"))}>
                <Copy className="mr-1.5 h-4 w-4" />Copy
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open(`mailto:?subject=${encodeURIComponent(`Meeting: ${m.title}`)}&body=${encodeURIComponent(summary(m))}`)}>
                <Mail className="mr-1.5 h-4 w-4" />Email client
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// Schedule: calendar + day agenda (incl. synced bookings), booking form, staff availability, self-booking link.
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, CalendarPlus, Copy, ExternalLink, Link2, MapPin, Phone, Users, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Appointment, TRUSTEES, pretty } from "./data";
import { useCRM } from "./store";
import { Empty, GOOD, Panel, Pill, SelectField, copy } from "./ui";

const KIND_ICON = { video: Video, phone: Phone, in_person: MapPin };
const KINDS = Object.keys(KIND_ICON) as Appointment["kind"][];
const TYPES = ["Consultation", "Assessment meeting", "1st counselling session", "2nd counselling session", "Proposal signing", "Follow-up"];

// Staff busy blocks by weekday (demo), in the same order as TRUSTEES
const BUSY: Record<string, string[]>[] = [
  { Monday: ["9:00–10:30"], Thursday: ["9:00–4:30"] },
  { Tuesday: ["11:00–12:30"], Friday: ["1:00–2:30"] },
  { Monday: ["11:00–1:00"], Wednesday: ["10:00–11:30"] },
];

export const ScheduleTab = () => {
  const { appointments } = useCRM();
  const [day, setDay] = useState(new Date());
  const agenda = appointments.filter((a) => isSameDay(new Date(a.date), day));
  const weekday = format(day, "EEEE");
  const bookingUrl = `${location.origin}/book/free-consultation`; // public self-booking page

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="space-y-6">
        {/* Month picker; days with appointments are underlined */}
        <Card className="p-3">
          <Calendar mode="single" selected={day} onSelect={(d) => d && setDay(d)}
            modifiers={{ booked: appointments.map((a) => new Date(a.date)) }}
            modifiersClassNames={{ booked: "font-bold underline decoration-primary decoration-2 underline-offset-4" }} />
        </Card>

        <Panel icon={Link2} title="Self-booking page" className="max-w-[300px]">
          <p className="mb-3 text-xs text-muted-foreground">Share this link or put it on your website. Bookings land here and in your synced calendar.</p>
          <p className="mb-3 select-all break-all rounded-md bg-muted p-2 font-mono text-xs">{bookingUrl}</p>
          <Button size="sm" variant="outline" className="w-full" onClick={() => copy(bookingUrl, "Booking link")}><Copy className="mr-2 h-4 w-4" />Copy link</Button>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel icon={CalendarDays} title={format(day, "EEEE, MMMM d")}>
          {!agenda.length && <Empty icon={CalendarDays} text="No appointments this day" />}
          <div className="space-y-2">{agenda.map((a) => <AgendaItem key={a.id} a={a} />)}</div>
        </Panel>

        <BookForm day={day} />

        <Panel icon={Users} title={`Staff availability · ${weekday}`}>
          <div className="grid gap-3 sm:grid-cols-3">
            {TRUSTEES.map((name, i) => {
              const busy = BUSY[i][weekday] ?? [];
              return (
                <div key={name} className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">{name}</p>
                  {busy.length ? busy.map((b) => <Pill key={b} className="mr-1 bg-muted text-muted-foreground">Busy {b}</Pill>) : <Pill className={GOOD}>Available all day</Pill>}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
};

// One appointment with join / copy-link actions
const AgendaItem = ({ a }: { a: Appointment }) => {
  const Icon = KIND_ICON[a.kind];
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <span className="w-20 text-sm font-medium tabular-nums">{a.time}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1"><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.client}</p></div>
      {a.source !== "CRM" && <Pill className="bg-muted text-muted-foreground">via {a.source}</Pill>}
      {a.url && <>
        <Button size="sm" asChild><a href={a.url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1.5 h-4 w-4" />Join</a></Button>
        <Button size="sm" variant="outline" aria-label="Copy meeting link" onClick={() => copy(a.url!, "Meeting link")}><Copy className="h-4 w-4" /></Button>
      </>}
    </div>
  );
};

// Book an appointment on the selected day
const BookForm = ({ day }: { day: Date }) => {
  const { clients, byId, addAppointment } = useCRM();
  const [f, setF] = useState({ clientId: "", title: TYPES[0], time: "10:00", kind: "video" as Appointment["kind"] });
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  const book = () => {
    const c = byId.get(f.clientId);
    if (!c) return toast.error("Choose a client first");
    const [h, m] = f.time.split(":").map(Number);
    addAppointment({ clientId: c.id, client: c.name, title: f.title, date: day.toISOString(), time: format(new Date(2000, 0, 1, h, m), "h:mm a"), kind: f.kind, source: "CRM" });
    toast.success(`${f.title} booked with ${c.name}`);
  };

  return (
    <Panel icon={CalendarPlus} title={`Book on ${format(day, "MMM d")}`}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <SelectField id="book-client" label="Client" placeholder="Choose a client" value={f.clientId} onChange={set("clientId")} options={clients.map((c) => c.id)} show={(id) => byId.get(id)!.name} />
        <SelectField id="book-type" label="Type" value={f.title} onChange={set("title")} options={TYPES} />
        <div className="space-y-1.5"><Label htmlFor="book-time">Time</Label><Input id="book-time" type="time" value={f.time} onChange={(e) => set("time")(e.target.value)} /></div>
        <SelectField id="book-kind" label="Meeting" value={f.kind} onChange={set("kind")} options={KINDS} show={pretty} />
      </div>
      <Button className="mt-4" onClick={book}>Book appointment</Button>
    </Panel>
  );
};

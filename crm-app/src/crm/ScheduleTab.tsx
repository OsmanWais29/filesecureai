// Schedule: calendar + day agenda (incl. synced bookings), book an appointment, staff availability,
// and the client self-booking page link.
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, CalendarPlus, Copy, ExternalLink, Link2, MapPin, Phone, Users, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from "./data";
import { useCRM } from "./store";
import { Empty, Pill, SectionTitle } from "./ui";

const KIND_ICON = { video: Video, phone: Phone, in_person: MapPin }; // meeting type -> icon

// Staff busy blocks per weekday (demo)
const STAFF = [
  { name: "Sarah Johnson, LIT", busy: { Monday: ["9:00–10:30"], Thursday: ["9:00–4:30"] } as Record<string, string[]> },
  { name: "John Doe, LIT", busy: { Tuesday: ["11:00–12:30"], Friday: ["1:00–2:30"] } as Record<string, string[]> },
  { name: "Jane Smith (Counsellor)", busy: { Monday: ["11:00–1:00"], Wednesday: ["10:00–11:30"] } as Record<string, string[]> },
];

// Copy text, with a toast either way
const copy = (text: string, what: string) =>
  navigator.clipboard.writeText(text).then(() => toast.success(`${what} copied`), () => toast.error("Copy failed — select the text instead"));

export const ScheduleTab = () => {
  const { appointments } = useCRM();
  const [day, setDay] = useState(new Date()); // selected date
  const agenda = appointments.filter((a) => isSameDay(new Date(a.date), day));
  const bookingUrl = `${window.location.origin}/book/free-consultation`; // public self-booking page

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="space-y-6">
        {/* Month picker; days with appointments are underlined */}
        <Card className="p-3">
          <Calendar
            mode="single" selected={day} onSelect={(d) => d && setDay(d)}
            modifiers={{ booked: appointments.map((a) => new Date(a.date)) }}
            modifiersClassNames={{ booked: "font-bold underline decoration-primary decoration-2 underline-offset-4" }}
          />
        </Card>

        {/* Client self-booking page */}
        <Card className="max-w-[300px] p-5">
          <SectionTitle icon={Link2}>Self-booking page</SectionTitle>
          <p className="mb-3 text-xs text-muted-foreground">Share this link or put it on your website. Bookings land here and in your synced calendar.</p>
          <p className="mb-3 select-all break-all rounded-md bg-muted p-2 font-mono text-xs">{bookingUrl}</p>
          <Button size="sm" variant="outline" className="w-full" onClick={() => copy(bookingUrl, "Booking link")}><Copy className="mr-2 h-4 w-4" />Copy link</Button>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Agenda for the selected day */}
        <Card className="p-5">
          <SectionTitle icon={CalendarDays}>{format(day, "EEEE, MMMM d")}</SectionTitle>
          {agenda.length === 0 && <Empty icon={CalendarDays} text="No appointments this day" />}
          <ul className="space-y-2">
            {agenda.map((a) => <AgendaItem key={a.id} a={a} />)}
          </ul>
        </Card>

        <BookForm day={day} />

        {/* Staff availability for that weekday */}
        <Card className="p-5">
          <SectionTitle icon={Users}>Staff availability · {format(day, "EEEE")}</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-3">
            {STAFF.map((s) => {
              const busy = s.busy[format(day, "EEEE")] ?? [];
              return (
                <div key={s.name} className="rounded-lg border p-3">
                  <p className="mb-2 text-sm font-medium">{s.name}</p>
                  {busy.length === 0
                    ? <Pill className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Available all day</Pill>
                    : busy.map((b) => <Pill key={b} className="mr-1 bg-muted text-muted-foreground">Busy {b}</Pill>)}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// One appointment row with join / copy actions
const AgendaItem = ({ a }: { a: Appointment }) => {
  const Icon = KIND_ICON[a.kind];
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <span className="w-20 text-sm font-medium tabular-nums">{a.time}</span>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{a.title}</p>
        <p className="text-xs text-muted-foreground">{a.client}</p>
      </div>
      {a.source !== "CRM" && <Pill className="bg-muted text-muted-foreground">via {a.source}</Pill>}
      {a.url && (
        <div className="flex gap-1">
          <Button size="sm" asChild><a href={a.url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1.5 h-4 w-4" />Join</a></Button>
          <Button size="sm" variant="outline" aria-label="Copy meeting link" onClick={() => copy(a.url!, "Meeting link")}><Copy className="h-4 w-4" /></Button>
        </div>
      )}
    </li>
  );
};

// Book an appointment for the selected day
const BookForm = ({ day }: { day: Date }) => {
  const { clients, addAppointment } = useCRM();
  const [clientId, setClientId] = useState("");
  const [title, setTitle] = useState("Consultation");
  const [time, setTime] = useState("10:00");
  const [kind, setKind] = useState<Appointment["kind"]>("video");

  const book = () => {
    const c = clients.find((x) => x.id === clientId);
    if (!c) return toast.error("Choose a client first");
    const [h, m] = time.split(":").map(Number);
    addAppointment({ clientId: c.id, client: c.name, title, date: day.toISOString(), time: format(new Date(2000, 0, 1, h, m), "h:mm a"), kind, source: "CRM" });
    toast.success(`${title} booked with ${c.name}`);
  };

  return (
    <Card className="p-5">
      <SectionTitle icon={CalendarPlus}>Book on {format(day, "MMM d")}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="space-y-1.5 lg:col-span-2">
          <Label htmlFor="book-client">Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id="book-client"><SelectValue placeholder="Choose a client" /></SelectTrigger>
            <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-title">Type</Label>
          <Select value={title} onValueChange={setTitle}>
            <SelectTrigger id="book-title"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Consultation", "Assessment meeting", "1st counselling session", "2nd counselling session", "Proposal signing", "Follow-up"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-time">Time</Label>
          <Input id="book-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="book-kind">Meeting</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as Appointment["kind"])}>
            <SelectTrigger id="book-kind"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="in_person">In person</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button className="mt-4" onClick={book}>Book appointment</Button>
    </Card>
  );
};

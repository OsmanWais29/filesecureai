// Schedule tab: calendar + day agenda, client self-booking links, and analytics.
import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, Clock, Copy, Link2, Mail, BarChart3, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPOINTMENTS, STAFF, TIME_ALLOCATION, WEEKLY_MEETINGS } from "./data";
import { Empty, LEVEL_STYLE, Pill, SectionTitle } from "./ui";

export const ScheduleTab = () => (
  <Tabs defaultValue="calendar" className="space-y-4">
    {/* Sub-navigation */}
    <TabsList>
      <TabsTrigger value="calendar">Calendar</TabsTrigger>
      <TabsTrigger value="booking">Self-booking</TabsTrigger>
      <TabsTrigger value="analytics">Analytics</TabsTrigger>
    </TabsList>
    <TabsContent value="calendar"><CalendarPanel /></TabsContent>
    <TabsContent value="booking"><BookingPanel /></TabsContent>
    <TabsContent value="analytics"><AnalyticsPanel /></TabsContent>
  </Tabs>
);

// ---------- Calendar + agenda for the picked day ----------
const CalendarPanel = () => {
  const [day, setDay] = useState(new Date()); // selected date
  const agenda = APPOINTMENTS.filter((a) => isSameDay(a.date, day)); // that day's appointments
  const weekday = format(day, "EEEE"); // e.g. "Monday" for staff lookup

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      {/* Month picker; days with appointments are underlined */}
      <Card className="p-3">
        <Calendar
          mode="single"
          selected={day}
          onSelect={(d) => d && setDay(d)}
          modifiers={{ booked: APPOINTMENTS.map((a) => a.date) }}
          modifiersClassNames={{ booked: "font-bold underline decoration-primary decoration-2 underline-offset-4" }}
        />
      </Card>

      <div className="space-y-6">
        {/* Appointments on the selected day */}
        <Card className="p-5">
          <SectionTitle icon={CalendarDays}>{format(day, "EEEE, MMMM d")}</SectionTitle>
          {agenda.length === 0 && <Empty icon={CalendarDays} text="No appointments this day" />}
          <ul className="space-y-2">
            {agenda.map((a) => (
              <li key={a.id} className="flex items-center gap-4 rounded-lg border p-3">
                <span className="flex w-24 items-center gap-1 whitespace-nowrap text-sm font-medium"><Clock className="h-3.5 w-3.5" />{a.time}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.client}</p>
                </div>
                <Pill className={LEVEL_STYLE[a.priority]}>{a.priority}</Pill>
              </li>
            ))}
          </ul>
        </Card>

        {/* Staff busy blocks for that weekday */}
        <Card className="p-5">
          <SectionTitle icon={Users}>Staff availability</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {STAFF.map((s) => {
              const busy = s.busy[weekday] ?? [];
              return (
                <div key={s.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="mb-2 text-xs text-muted-foreground">{s.role}</p>
                  {busy.length === 0
                    ? <Pill className={LEVEL_STYLE.low}>Available all day</Pill>
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

// ---------- Generate a self-booking link for a client ----------
const BookingPanel = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState(""); // generated URL

  // Random token -> booking URL
  const generate = () => {
    if (!name || !email) return toast.error("Enter the client's name and email");
    setLink(`${window.location.origin}/booking-request/${crypto.randomUUID()}`);
  };

  // Open the user's mail app with the link pre-filled
  const sendEmail = () =>
    window.open(`mailto:${email}?subject=${encodeURIComponent("Book your appointment")}&body=${encodeURIComponent(`Hi ${name},\n\nPlease pick a time that suits you:\n${link}\n\nBest regards`)}`);

  return (
    <Card className="grid gap-6 p-6 md:grid-cols-2">
      {/* Form */}
      <div className="space-y-3">
        <SectionTitle icon={Link2}>Create booking link</SectionTitle>
        <Input placeholder="Client name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="email" placeholder="client@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button onClick={generate} className="w-full">Generate link</Button>
      </div>

      {/* Result */}
      <div className="flex flex-col justify-center rounded-lg border border-dashed p-5">
        {!link ? (
          <Empty icon={Link2} text="Your link will appear here" />
        ) : (
          <div className="space-y-3">
            <p className="break-all rounded-md bg-muted p-3 font-mono text-xs">{link}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }}>
                <Copy className="mr-2 h-4 w-4" />Copy
              </Button>
              <Button className="flex-1" onClick={sendEmail}><Mail className="mr-2 h-4 w-4" />Email client</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ---------- Two simple bar charts ----------
const AnalyticsPanel = () => (
  <div className="grid gap-6 md:grid-cols-2">
    <ChartCard title="Meetings per weekday" data={WEEKLY_MEETINGS} x="day" y="meetings" />
    <ChartCard title="Hours by activity (weekly)" data={TIME_ALLOCATION} x="name" y="hours" />
  </div>
);

// Reusable bar-chart card
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChartCard = ({ title, data, x, y }: { title: string; data: any[]; x: string; y: string }) => (
  <Card className="p-5">
    <SectionTitle icon={BarChart3}>{title}</SectionTitle>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis dataKey={x} tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
        <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
        <Bar dataKey={y} fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

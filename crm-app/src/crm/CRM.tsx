// CRM shell: header (Client options, Ask your CRM, Add client), headline numbers and tabs.
import { useState } from "react";
import {
  AlertTriangle, Bot, CalendarDays, Check, ChevronDown, Landmark, UserPlus, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isToday } from "date-fns";
import { daysAgo, money } from "./data";
import { useCRM } from "./store";
import { StatCard } from "./ui";
import { IntakeDialog } from "./IntakeDialog";
import { Assistant } from "./Assistant";
import { DashboardTab } from "./DashboardTab";
import { ClientsTab } from "./ClientsTab";
import { PipelineTab } from "./PipelineTab";
import { ScheduleTab } from "./ScheduleTab";
import { ReportsTab } from "./ReportsTab";
import { AutomationsTab } from "./AutomationsTab";
import { IntegrationsTab } from "./IntegrationsTab";
import { DocumentsTab } from "./DocumentsTab";

const TABS = ["Dashboard", "Clients", "Pipeline", "Schedule", "Reports", "Automations", "Integrations", "Documents"];

export const CRM = () => {
  const { clients, appointments, deadlines } = useCRM();
  const [tab, setTab] = useState("Dashboard");
  const [clientId, setClientId] = useState<string | null>(null); // null = All clients view
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  // Jump to one client's profile (or the All clients view) from anywhere
  const openClient = (id: string | null) => { setClientId(id); setTab("Clients"); };
  const current = clients.find((c) => c.id === clientId);

  // Headline numbers
  const active = clients.filter((c) => ["Filed", "In administration"].includes(c.stage));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Client Relationship Management</h1>
          <p className="text-sm text-muted-foreground">Leads, estates and proposals, from first call to discharge.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Client options: pick one client, or the global view */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Users className="mr-2 h-4 w-4" />{current ? current.name : "Client options"}<ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
              <DropdownMenuItem onClick={() => openClient(null)}><Users className="mr-2 h-4 w-4" />All clients</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Open a client profile</DropdownMenuLabel>
              {clients.map((c) => (
                <DropdownMenuItem key={c.id} onClick={() => openClient(c.id)}>
                  <Check className={`mr-2 h-4 w-4 ${c.id === clientId ? "opacity-100" : "opacity-0"}`} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.stage}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={() => setAskOpen(true)}><Bot className="mr-2 h-4 w-4" />Ask your CRM</Button>
          <Button onClick={() => setIntakeOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Add client</Button>
        </div>
      </header>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="New leads" hint={`${clients.filter((c) => c.stage === "New lead").length} awaiting a call`} value={clients.filter((c) => daysAgo(c.createdAt) <= 30).length} />
        <StatCard icon={Landmark} label="Active estates & proposals" hint={`${money(active.reduce((s, c) => s + c.totalDebt, 0))} of debt`} value={active.length} />
        <StatCard icon={CalendarDays} label="Appointments today" value={appointments.filter((a) => isToday(new Date(a.date))).length} />
        <StatCard icon={AlertTriangle} label="Overdue deadlines" value={deadlines.filter((d) => !d.done && daysAgo(d.due) > 0).length} />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          {TABS.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>
        <TabsContent value="Dashboard"><DashboardTab openClient={openClient} /></TabsContent>
        <TabsContent value="Clients"><ClientsTab selectedId={clientId} onSelect={openClient} /></TabsContent>
        <TabsContent value="Pipeline"><PipelineTab openClient={openClient} /></TabsContent>
        <TabsContent value="Schedule"><ScheduleTab /></TabsContent>
        <TabsContent value="Reports"><ReportsTab /></TabsContent>
        <TabsContent value="Automations"><AutomationsTab /></TabsContent>
        <TabsContent value="Integrations"><IntegrationsTab /></TabsContent>
        <TabsContent value="Documents"><DocumentsTab /></TabsContent>
      </Tabs>

      <IntakeDialog open={intakeOpen} onOpenChange={setIntakeOpen} />
      <Assistant open={askOpen} onOpenChange={setAskOpen} openClient={openClient} />
    </div>
  );
};

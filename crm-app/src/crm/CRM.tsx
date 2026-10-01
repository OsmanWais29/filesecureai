// CRM shell: header (Client options, Ask your CRM, Add client), headline numbers and tabs.
// Tabs and dialogs are lazy-loaded, so each one's code (e.g. the charts library) downloads only when first opened.
import { lazy, Suspense, useState } from "react";
import { isToday } from "date-fns";
import { AlertTriangle, Bot, CalendarDays, Check, ChevronDown, Landmark, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { daysAgo, isActive, isLate, money, sumDebt } from "./data";
import { useCRM } from "./store";
import { StatCard } from "./ui";
import { DashboardTab } from "./DashboardTab";

// Load a named export on demand
const load = <K extends string>(imp: () => Promise<Record<K, React.ComponentType<any>>>, name: K) => // eslint-disable-line @typescript-eslint/no-explicit-any
  lazy(() => imp().then((m) => ({ default: m[name] })));

const ClientsTab = load(() => import("./ClientsTab"), "ClientsTab");
const PipelineTab = load(() => import("./PipelineTab"), "PipelineTab");
const ScheduleTab = load(() => import("./ScheduleTab"), "ScheduleTab");
const ReportsTab = load(() => import("./ReportsTab"), "ReportsTab");
const AutomationsTab = load(() => import("./AutomationsTab"), "AutomationsTab");
const IntegrationsTab = load(() => import("./IntegrationsTab"), "IntegrationsTab");
const DocumentsTab = load(() => import("./DocumentsTab"), "DocumentsTab");
const IntakeDialog = load(() => import("./IntakeDialog"), "IntakeDialog");
const Assistant = load(() => import("./Assistant"), "Assistant");

export const CRM = () => {
  const { clients, appointments, deadlines } = useCRM();
  const [tab, setTab] = useState("Dashboard");
  const [clientId, setClientId] = useState<string | null>(null); // null = All clients view
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  // Jump to one client's profile (or All clients) from anywhere
  const openClient = (id: string | null) => { setClientId(id); setTab("Clients"); };
  const current = clients.find((c) => c.id === clientId);
  const active = clients.filter(isActive);

  // Tab name -> content
  const tabs: Record<string, JSX.Element> = {
    Dashboard: <DashboardTab openClient={openClient} />,
    Clients: <ClientsTab selectedId={clientId} onSelect={openClient} />,
    Pipeline: <PipelineTab openClient={openClient} />,
    Schedule: <ScheduleTab />,
    Reports: <ReportsTab />,
    Automations: <AutomationsTab />,
    Integrations: <IntegrationsTab />,
    Documents: <DocumentsTab />,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Client Relationship Management</h1>
          <p className="text-sm text-muted-foreground">Leads, estates and proposals, from first call to discharge.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Client options: one client's profile, or the global view */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Users className="mr-2 h-4 w-4" />{current?.name ?? "Client options"}<ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 w-64 overflow-y-auto">
              <DropdownMenuItem onClick={() => openClient(null)}><Users className="mr-2 h-4 w-4" />All clients</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Open a client profile</DropdownMenuLabel>
              {clients.map((c) => (
                <DropdownMenuItem key={c.id} onClick={() => openClient(c.id)}>
                  <Check className={cn("mr-2 h-4 w-4", c.id !== clientId && "opacity-0")} />
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
        <StatCard icon={Landmark} label="Active estates & proposals" hint={`${money(sumDebt(active))} of debt`} value={active.length} />
        <StatCard icon={CalendarDays} label="Appointments today" value={appointments.filter((a) => isToday(new Date(a.date))).length} />
        <StatCard icon={AlertTriangle} label="Overdue deadlines" value={deadlines.filter(isLate).length} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          {Object.keys(tabs).map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>
        {Object.entries(tabs).map(([t, el]) => (
          <TabsContent key={t} value={t}>
            <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>{el}</Suspense>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialogs load in the background after the first paint and keep their state between opens */}
      <Suspense>
        <IntakeDialog open={intakeOpen} onOpenChange={setIntakeOpen} />
        <Assistant open={askOpen} onOpenChange={setAskOpen} openClient={openClient} />
      </Suspense>
    </div>
  );
};

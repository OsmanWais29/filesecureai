// CRM entry point: header, headline stats, tab navigation and the add-client dialog.
// Pages just render <CRM /> (or <CRM intake /> for the full intake form).
import { useState } from "react";
import { UserPlus, Users, UserCheck, AlertTriangle, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APPOINTMENTS } from "./data";
import { useClients } from "./useClients";
import { StatCard } from "./ui";
import { ClientDialog } from "./ClientDialog";
import { ClientsTab } from "./ClientsTab";
import { ScheduleTab } from "./ScheduleTab";
import { ActivityTab } from "./ActivityTab";
import { DocumentsTab } from "./DocumentsTab";
import { MeetingsTab } from "./MeetingsTab";

export const CRM = ({ intake = false }: { intake?: boolean }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: clients = [], isLoading } = useClients();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Page header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage clients, schedules, documents and meetings in one place.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />Add client
        </Button>
      </header>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total clients" value={clients.length} />
        <StatCard icon={UserCheck} label="Active" value={clients.filter((c) => c.status === "active").length} />
        <StatCard icon={AlertTriangle} label="High risk" value={clients.filter((c) => c.risk === "high").length} />
        <StatCard icon={CalendarDays} label="Upcoming appointments" value={APPOINTMENTS.length} />
      </div>

      {/* Tabs (skeleton while clients load) */}
      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <Tabs defaultValue="clients" className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start">
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>
          <TabsContent value="clients"><ClientsTab clients={clients} /></TabsContent>
          <TabsContent value="schedule"><ScheduleTab /></TabsContent>
          <TabsContent value="activity"><ActivityTab clients={clients} /></TabsContent>
          <TabsContent value="documents"><DocumentsTab clients={clients} /></TabsContent>
          <TabsContent value="meetings"><MeetingsTab /></TabsContent>
        </Tabs>
      )}

      <ClientDialog open={dialogOpen} onOpenChange={setDialogOpen} intake={intake} />
    </div>
  );
};


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntelligentScheduling } from "@/components/crm/IntelligentScheduling";
import { DocumentVault } from "@/components/crm/DocumentVault";
import { AIWorkflow } from "@/components/crm/AIWorkflow";
import { ClientView } from "@/components/crm/ClientView";
import { MeetingsList } from "@/components/crm/meetings/MeetingsList";
import { TaskList } from "@/components/crm/tasks/TaskList";
import { IntegrationsSection } from "@/components/crm/integrations/IntegrationsSection";
import { Calendar, FileCheck, BrainCog, Users, Calendar as CalendarIcon, CheckSquare, Settings } from "lucide-react";

export const CRMTabs = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="clients" className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="clients" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clients</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Meetings</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-1">
            <BrainCog className="h-4 w-4" />
            <span className="hidden sm:inline">AI Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Client Management</h2>
            <p className="text-muted-foreground">Manage your client relationships and interactions.</p>
            <ClientView />
          </div>
        </TabsContent>
        
        <TabsContent value="scheduling" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Intelligent Scheduling</h2>
            <p className="text-muted-foreground">AI-powered scheduling with client booking portals.</p>
            <IntelligentScheduling />
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Meetings Management</h2>
            <p className="text-muted-foreground">Schedule, manage, and track all your client meetings.</p>
            <MeetingsList />
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Task Management</h2>
            <p className="text-muted-foreground">Organize and track tasks for your cases and clients.</p>
            <TaskList />
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Document Vault</h2>
            <p className="text-muted-foreground">Secure document storage and management for your clients.</p>
            <DocumentVault />
          </div>
        </TabsContent>
        
        <TabsContent value="workflow" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">AI Workflow Automation</h2>
            <p className="text-muted-foreground">Automate repetitive tasks with AI-powered workflows.</p>
            <AIWorkflow />
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Integrations & Settings</h2>
            <p className="text-muted-foreground">Connect with third-party services and configure your CRM settings.</p>
            <IntegrationsSection />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

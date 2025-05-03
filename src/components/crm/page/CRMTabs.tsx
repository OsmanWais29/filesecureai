
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntelligentScheduling } from "@/components/crm/IntelligentScheduling";
import { DocumentVault } from "@/components/crm/DocumentVault";
import { AIWorkflow } from "@/components/crm/AIWorkflow";
import { Calendar, FileCheck, BrainCog, Video } from "lucide-react";
import { MeetingsTabs } from "@/components/meetings/MeetingsTabs";

export const CRMTabs = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard Modules</h2>
      <p className="text-muted-foreground">Access tools and features to manage your clients efficiently.</p>
      
      <Tabs defaultValue="scheduling" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="scheduling" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-1">
            <BrainCog className="h-4 w-4" />
            <span className="hidden sm:inline">AI Workflow</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Meetings Hub</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="scheduling" className="space-y-4">
          <IntelligentScheduling />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <DocumentVault />
        </TabsContent>
        
        <TabsContent value="workflow" className="space-y-4">
          <AIWorkflow />
        </TabsContent>
        
        <TabsContent value="meetings" className="space-y-4">
          <MeetingsTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

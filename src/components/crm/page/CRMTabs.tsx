
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntelligentScheduling } from "../IntelligentScheduling";
import { ClientProfileView } from "../components/profile/ClientProfileView";
import { ClientDocumentsManager } from "../components/documents/ClientDocumentsManager";
import { MeetingsContainer } from "../meetings/MeetingsContainer";
import { ClientActivityTimeline } from "../components/activity/ClientActivityTimeline";

export const CRMTabs = () => {
  // Mock client data - in real implementation, this would come from props or context
  const mockClient = {
    id: "client-001",
    name: "John Smith"
  };

  return (
    <Tabs defaultValue="client-profile" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="client-profile">Client Profile</TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="activity-timeline">Activity Timeline</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="meetings">Meetings</TabsTrigger>
      </TabsList>

      <TabsContent value="client-profile" className="space-y-4">
        <ClientProfileView />
      </TabsContent>
      
      <TabsContent value="dashboard" className="space-y-4">
        <IntelligentScheduling />
      </TabsContent>
      
      <TabsContent value="activity-timeline" className="space-y-4">
        <ClientActivityTimeline />
      </TabsContent>
      
      <TabsContent value="documents" className="space-y-4">
        <ClientDocumentsManager 
          clientId={mockClient.id}
          clientName={mockClient.name}
        />
      </TabsContent>
      
      <TabsContent value="meetings" className="space-y-4">
        <MeetingsContainer />
      </TabsContent>
    </Tabs>
  );
};

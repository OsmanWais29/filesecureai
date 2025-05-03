
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingsHeader } from "./MeetingsHeader";
import { MeetingsOverview } from "./MeetingsOverview";
import { UpcomingMeetings } from "./UpcomingMeetings";
import { JoinMeetingPanel } from "./JoinMeetingPanel";
import { MeetingNotes } from "./MeetingNotes";
import { MeetingAgenda } from "./MeetingAgenda";
import { MeetingsAnalytics } from "@/components/analytics/meetings/MeetingsAnalytics";
import { IntegrationsPanel } from "./IntegrationsPanel";

export const MeetingsTabs = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-6">
      <MeetingsHeader />
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="join">Join Meeting</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <MeetingsOverview setActiveTab={setActiveTab} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <UpcomingMeetings />
        </TabsContent>
        
        <TabsContent value="join" className="space-y-4">
          <JoinMeetingPanel />
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <MeetingNotes />
        </TabsContent>
        
        <TabsContent value="agenda" className="space-y-4">
          <MeetingAgenda />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <MeetingsAnalytics />
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <IntegrationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};


import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingsOverview } from "./MeetingsOverview";
import { UpcomingMeetings } from "./UpcomingMeetings";
import { JoinMeetingPanel } from "./JoinMeetingPanel";
import { MeetingNotes } from "./MeetingNotes";
import { MeetingAgenda } from "./MeetingAgenda";
import { MeetingsAnalytics } from "@/components/analytics/meetings/MeetingsAnalytics";

interface MeetingsTabsProps {
  clientName?: string;
}

export const MeetingsTabs = ({ clientName = "Client" }: MeetingsTabsProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Meetings Hub</h2>
        <p className="text-muted-foreground">
          {clientName ? `Manage meetings with ${clientName}` : "Manage client meetings"}
        </p>
      </div>
      
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
          <TabsTrigger value="analytics">Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <MeetingsOverview setActiveTab={setActiveTab} clientName={clientName} />
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <UpcomingMeetings clientName={clientName} />
        </TabsContent>
        
        <TabsContent value="join" className="space-y-4">
          <JoinMeetingPanel clientName={clientName} />
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <MeetingNotes clientName={clientName} />
        </TabsContent>
        
        <TabsContent value="agenda" className="space-y-4">
          <MeetingAgenda clientName={clientName} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <MeetingsAnalytics clientName={clientName} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

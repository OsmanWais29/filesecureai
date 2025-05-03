
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingsCalendar } from "./MeetingsCalendar";
import { MeetingsScheduler } from "./MeetingsScheduler";
import { MeetingsAnalytics } from "./MeetingsAnalytics";
import { MeetingsSettings } from "./MeetingsSettings";

interface MeetingsTabsProps {
  clientName?: string;
}

export const MeetingsTabs: React.FC<MeetingsTabsProps> = ({ clientName = "Client" }) => {
  return (
    <Tabs defaultValue="calendar" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="calendar" className="space-y-4">
        <MeetingsCalendar />
      </TabsContent>
      
      <TabsContent value="schedule" className="space-y-4">
        <MeetingsScheduler clientName={clientName} />
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
        <MeetingsAnalytics clientName={clientName} />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <MeetingsSettings />
      </TabsContent>
    </Tabs>
  );
};


import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntelligentScheduling } from "@/components/crm/IntelligentScheduling";
import { DocumentVault } from "@/components/crm/DocumentVault";
import { AIWorkflow } from "@/components/crm/AIWorkflow";
import { Calendar, FileCheck, BrainCog, BarChart, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MeetingsOverview } from "@/components/meetings/MeetingsOverview";
import { UpcomingMeetings } from "@/components/meetings/UpcomingMeetings";
import { JoinMeetingPanel } from "@/components/meetings/JoinMeetingPanel";
import { MeetingNotes } from "@/components/meetings/MeetingNotes";
import { MeetingAgenda } from "@/components/meetings/MeetingAgenda";
import { MeetingsAnalytics } from "@/components/analytics/meetings/MeetingsAnalytics";
import { useState } from "react";

export const CRMTabs = () => {
  const [activeMeetingsTab, setActiveMeetingsTab] = useState("overview");

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Dashboard Modules</h2>
      <p className="text-muted-foreground">Access tools and features to manage your clients efficiently.</p>
      
      <Tabs defaultValue="scheduling" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
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
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
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
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Analytics</CardTitle>
              <CardDescription>Track key performance indicators and client trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-medium text-sm">Active Clients</h3>
                  <p className="text-2xl font-bold mt-2">67</p>
                  <p className="text-xs text-green-500 mt-1">↑ 12% from last month</p>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium text-sm">Avg. Client Value</h3>
                  <p className="text-2xl font-bold mt-2">$2,450</p>
                  <p className="text-xs text-green-500 mt-1">↑ 8% from last month</p>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-medium text-sm">Client Retention</h3>
                  <p className="text-2xl font-bold mt-2">94%</p>
                  <p className="text-xs text-green-500 mt-1">↑ 2% from last month</p>
                </Card>
              </div>
              
              <div className="h-64 bg-muted/40 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Client growth chart will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="meetings" className="space-y-4">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Meetings Hub</h1>
              <p className="text-muted-foreground">
                Schedule, manage, and analyze meetings with clients
              </p>
            </div>

            <Tabs 
              value={activeMeetingsTab} 
              onValueChange={setActiveMeetingsTab} 
              className="space-y-4"
            >
              <TabsList className="w-full border-b bg-transparent h-auto p-0 justify-start">
                <TabsTrigger 
                  value="overview" 
                  className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="upcoming" 
                  className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Upcoming Meetings
                </TabsTrigger>
                <TabsTrigger 
                  value="join" 
                  className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Join Meeting
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Notes
                </TabsTrigger>
                <TabsTrigger 
                  value="agenda" 
                  className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Agenda
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              <div className="pt-4">
                <TabsContent value="overview" className="m-0">
                  <MeetingsOverview setActiveTab={setActiveMeetingsTab} />
                </TabsContent>
                
                <TabsContent value="upcoming" className="m-0">
                  <UpcomingMeetings />
                </TabsContent>
                
                <TabsContent value="join" className="m-0">
                  <JoinMeetingPanel />
                </TabsContent>
                
                <TabsContent value="notes" className="m-0">
                  <MeetingNotes />
                </TabsContent>
                
                <TabsContent value="agenda" className="m-0">
                  <MeetingAgenda />
                </TabsContent>
                
                <TabsContent value="analytics" className="m-0">
                  <MeetingsAnalytics />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

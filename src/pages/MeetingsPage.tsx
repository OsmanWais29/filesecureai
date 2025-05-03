
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import NotesStandalonePage from "./meetings/NotesStandalonePage";
import AgendaStandalonePage from "./meetings/AgendaStandalonePage";
import FeedbackStandalonePage from "./meetings/FeedbackStandalonePage";
import { MeetingsOverview } from "@/components/meetings/MeetingsOverview";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingMeetings } from "@/components/meetings/UpcomingMeetings";
import { JoinMeetingPanel } from "@/components/meetings/JoinMeetingPanel";
import { MeetingNotes } from "@/components/meetings/MeetingNotes";
import { MeetingAgenda } from "@/components/meetings/MeetingAgenda";
import { MeetingAnalytics } from "@/components/meetings/MeetingAnalytics";
import { MeetingsAnalytics } from "@/components/analytics/meetings/MeetingsAnalytics";

const MeetingsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the base meetings page
  const isMainPage = location.pathname === "/meetings" || location.pathname === "/meetings/";

  if (!isMainPage) {
    // Handle standalone pages (notes, agenda, feedback)
    return (
      <Routes>
        <Route path="/notes" element={<NotesStandalonePage />} />
        <Route path="/agenda" element={<AgendaStandalonePage />} />
        <Route path="/feedback" element={<FeedbackStandalonePage />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Meetings Hub</h1>
          <p className="text-muted-foreground mb-6">
            Schedule, manage, and analyze meetings with clients
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
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

              <div className="p-6">
                <TabsContent value="overview" className="m-0">
                  <MeetingsOverview setActiveTab={setActiveTab} />
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MeetingsPage;

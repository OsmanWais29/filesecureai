
import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingMeetings } from "@/components/meetings/UpcomingMeetings";
import { JoinMeetingPanel } from "@/components/meetings/JoinMeetingPanel";
import { MeetingAnalytics } from "@/components/meetings/MeetingAnalytics";
import { MeetingsAnalytics } from "@/components/analytics/meetings/MeetingsAnalytics";
import { MeetingsOverview } from "@/components/meetings/MeetingsOverview";

const MeetingsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const location = useLocation();

  // Check if we're on the base meetings page
  const isMainPage = location.pathname === "/meetings" || location.pathname === "/meetings/";

  if (!isMainPage) {
    // Show 404 or redirect to main meetings page
    return <div>Page not found</div>;
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

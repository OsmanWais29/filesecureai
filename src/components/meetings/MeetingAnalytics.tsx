
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeetingsAnalytics } from "@/components/analytics/meetings/MeetingsAnalytics";
import { FeedbackAnalytics } from "./feedback/FeedbackAnalytics";

interface MeetingAnalyticsProps {
  clientName?: string;
}

export const MeetingAnalytics = ({ clientName }: MeetingAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <MeetingsAnalytics clientName={clientName} />
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-4">
          <FeedbackAnalytics />
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Trends</CardTitle>
              <CardDescription>Analysis of meeting patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Meeting trend analysis will be available after more meetings are completed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

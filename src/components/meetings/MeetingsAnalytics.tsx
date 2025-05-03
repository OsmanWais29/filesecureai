
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Calendar, Clock, Users } from 'lucide-react';

interface MeetingsAnalyticsProps {
  clientName: string;
}

export const MeetingsAnalytics: React.FC<MeetingsAnalyticsProps> = ({ clientName }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meeting Analytics</h2>
        <span className="text-sm text-muted-foreground">
          Showing data for client: {clientName}
        </span>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 min</div>
            <p className="text-xs text-muted-foreground">-5 min from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+4 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meeting Effectiveness</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Meeting Summary for {clientName}</CardTitle>
          <CardDescription>
            Analysis of meeting patterns and outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Recent Meetings</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Initial Consultation</span>
                  <span className="text-muted-foreground">Mar 15, 2024</span>
                </li>
                <li className="flex justify-between">
                  <span>Financial Review</span>
                  <span className="text-muted-foreground">Apr 2, 2024</span>
                </li>
                <li className="flex justify-between">
                  <span>Document Preparation</span>
                  <span className="text-muted-foreground">Apr 18, 2024</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Upcoming Meetings</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Final Review</span>
                  <span className="text-muted-foreground">May 5, 2024</span>
                </li>
                <li className="flex justify-between">
                  <span>Signing Appointment</span>
                  <span className="text-muted-foreground">May 12, 2024</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

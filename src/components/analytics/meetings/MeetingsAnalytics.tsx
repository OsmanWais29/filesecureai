
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface MeetingsAnalyticsProps {
  clientName?: string;
}

export const MeetingsAnalytics = ({ clientName }: MeetingsAnalyticsProps) => {
  // Sample data - in a real app, this would be fetched from an API
  const data = [
    { month: "Jan", meetings: 4, attendance: 3.8, satisfaction: 4.2 },
    { month: "Feb", meetings: 5, attendance: 4.7, satisfaction: 4.5 },
    { month: "Mar", meetings: 3, attendance: 3.0, satisfaction: 4.0 },
    { month: "Apr", meetings: 6, attendance: 5.9, satisfaction: 4.7 },
    { month: "May", meetings: 4, attendance: 3.8, satisfaction: 4.3 },
  ];

  // Display personalized metrics for a specific client if clientName is provided
  const meetingsData = clientName ? 
    data.map(item => ({ ...item, meetings: Math.round(item.meetings * 0.6) })) : 
    data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">
          {clientName ? `Meeting Analytics for ${clientName}` : "Meeting Analytics"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {clientName 
            ? `Review meeting trends and client engagement insights for ${clientName}` 
            : "Review trends and insights from client meetings"}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meeting Trends Chart */}
        <Card className="col-span-3">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">Meeting Trends</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={meetingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="meetings" stroke="#8884d8" name="Meetings" />
                  <Line type="monotone" dataKey="attendance" stroke="#82ca9d" name="Attendance" />
                  <Line type="monotone" dataKey="satisfaction" stroke="#ffc658" name="Satisfaction (1-5)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

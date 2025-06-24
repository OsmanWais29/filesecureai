
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { DocumentAnalyticsData } from "../types";
import { RealTimeMetrics } from "../RealTimeMetrics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, ClockIcon } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface DocumentAnalyticsProps {
  data?: DocumentAnalyticsData;
}

export const DocumentAnalytics = ({ data }: DocumentAnalyticsProps) => {
  const { trackEvent } = useAnalytics();
  const [activeTab, setActiveTab] = useState("realtime");
  
  // Track tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    trackEvent("analytics_tab_change", { tab: value });
  };
  
  useEffect(() => {
    // Track component view
    trackEvent("analytics_view", { component: "DocumentAnalytics" });
  }, [trackEvent]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="realtime" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="realtime">Real-Time Metrics</TabsTrigger>
          <TabsTrigger value="documents">Document Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="realtime" className="mt-6">
          <RealTimeMetrics />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Document Processing</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.taskVolume[data.taskVolume.length - 1]?.tasks || 0}
                </div>
                <p className="text-xs text-muted-foreground">Documents processed this month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                <ClockIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.timeSaved[data.timeSaved.length - 1]?.hours || 0}h
                </div>
                <p className="text-xs text-muted-foreground">Hours saved through automation</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Reduction</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data && data.errorReduction[0].errors - data.errorReduction[data.errorReduction.length - 1].errors}
                </div>
                <p className="text-xs text-muted-foreground">Fewer errors compared to start</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Processing Volume</CardTitle>
                <CardDescription>Monthly processing volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
                    <LineChart
                      data={data?.taskVolume}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Documents Processed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time Efficiency</CardTitle>
                  <CardDescription>Hours saved through document automation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
                      <BarChart
                        data={data?.timeSaved}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="#4ade80" name="Hours Saved" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Error Reduction</CardTitle>
                  <CardDescription>Monthly errors in document processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
                      <LineChart
                        data={data?.errorReduction}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="errors"
                          stroke="#ef4444"
                          activeDot={{ r: 8 }}
                          name="Processing Errors"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  MessageSquare,
  Settings,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrusteeIndex = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Document Analysis",
      description: "Upload and analyze bankruptcy forms",
      icon: FileText,
      action: () => navigate("/trustee/documents"),
      color: "bg-blue-500"
    },
    {
      title: "Client Management",
      description: "Manage client relationships and cases",
      icon: Users,
      action: () => navigate("/trustee/crm"),
      color: "bg-green-500"
    },
    {
      title: "Risk Assessment",
      description: "Review compliance and risk indicators",
      icon: AlertTriangle,
      action: () => navigate("/trustee/analytics"),
      color: "bg-orange-500"
    },
    {
      title: "Analytics Dashboard",
      description: "View performance metrics and insights",
      icon: BarChart3,
      action: () => navigate("/trustee/analytics"),
      color: "bg-purple-500"
    }
  ];

  const recentActivity = [
    { id: 1, action: "Form 47 analyzed", client: "John Doe", time: "2 hours ago" },
    { id: 2, action: "Risk assessment completed", client: "Jane Smith", time: "4 hours ago" },
    { id: 3, action: "Document uploaded", client: "Mike Johnson", time: "1 day ago" },
    { id: 4, action: "Client meeting scheduled", client: "Sarah Wilson", time: "2 days ago" }
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trustee Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your cases.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/trustee/calendar")} variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </Button>
            <Button onClick={() => navigate("/trustee/support")} variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Support
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">157</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">+2% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-full ${action.color} text-white`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.client}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeIndex;

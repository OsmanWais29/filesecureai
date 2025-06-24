
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  AlertTriangle,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

const TrusteeNotificationsPage = () => {
  const notifications = [
    {
      id: "1",
      type: "risk",
      title: "High Risk Alert",
      message: "Client John Smith has missing financial statements",
      time: "2 hours ago",
      priority: "high",
      unread: true
    },
    {
      id: "2", 
      type: "document",
      title: "Document Analysis Complete",
      message: "Form 47 analysis completed for Sarah Johnson",
      time: "4 hours ago", 
      priority: "medium",
      unread: true
    },
    {
      id: "3",
      type: "meeting",
      title: "Upcoming Meeting",
      message: "Client consultation scheduled for 2:00 PM today",
      time: "6 hours ago",
      priority: "medium", 
      unread: false
    },
    {
      id: "4",
      type: "compliance",
      title: "Compliance Review Due", 
      message: "Monthly compliance review due in 3 days",
      time: "1 day ago",
      priority: "high",
      unread: false
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "risk": return AlertTriangle;
      case "document": return FileText;
      case "meeting": return Calendar;
      case "compliance": return CheckCircle;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications Center</h1>
            <p className="text-gray-600 mt-1">Stay updated with real-time alerts and important updates.</p>
          </div>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>

        {/* Notification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">27</div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => {
                const IconComponent = getIcon(notification.type);
                return (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      notification.type === 'risk' ? 'bg-red-100' :
                      notification.type === 'document' ? 'bg-blue-100' :
                      notification.type === 'meeting' ? 'bg-green-100' :
                      'bg-yellow-100'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeNotificationsPage;

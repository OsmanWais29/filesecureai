
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
  Mail,
  Settings,
  Check
} from "lucide-react";

const TrusteeNotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "High Risk Case Detected",
      message: "Client John Doe's case requires immediate attention due to irregular income patterns.",
      time: "2 hours ago",
      read: false,
      priority: "high"
    },
    {
      id: 2,
      type: "document",
      title: "Document Analysis Complete", 
      message: "Form 47 analysis for Jane Smith has been completed with 3 risk indicators identified.",
      time: "4 hours ago",
      read: false,
      priority: "medium"
    },
    {
      id: 3,
      type: "calendar",
      title: "Upcoming Deadline",
      message: "Consumer proposal filing deadline for Mike Johnson is due in 3 days.",
      time: "1 day ago", 
      read: true,
      priority: "high"
    },
    {
      id: 4,
      type: "email",
      title: "Client Response Required",
      message: "Sarah Wilson has responded to your email regarding missing documentation.",
      time: "2 days ago",
      read: true,
      priority: "low"
    },
    {
      id: 5,
      type: "system",
      title: "System Update",
      message: "SecureFiles AI has been updated with enhanced risk assessment features.",
      time: "3 days ago",
      read: true,
      priority: "low"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "alert": return AlertTriangle;
      case "document": return FileText;
      case "calendar": return Calendar;
      case "email": return Mail;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with your cases and system alerts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter(n => !n.read).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.time.includes('day') || n.time.includes('hour')).length}
              </div>
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
                    className={`p-4 border rounded-lg transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                        notification.type === 'document' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'calendar' ? 'bg-green-100 text-green-600' :
                        notification.type === 'email' ? 'bg-purple-100 text-purple-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{notification.time}</span>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button variant="outline" size="sm">Mark as Read</Button>
                            )}
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </div>
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

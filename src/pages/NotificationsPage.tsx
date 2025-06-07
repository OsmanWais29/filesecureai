
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, FileText, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const NotificationsPage = () => {
  const notifications = [
    {
      id: 1,
      title: "New Document Uploaded",
      message: "Form 47 has been uploaded for client John Doe",
      type: "info",
      time: "2 minutes ago",
      read: false,
      icon: FileText
    },
    {
      id: 2,
      title: "Risk Assessment Alert",
      message: "High risk detected in Form 31 for client Jane Smith",
      type: "warning",
      time: "15 minutes ago",
      read: false,
      icon: AlertTriangle
    },
    {
      id: 3,
      title: "Task Completed",
      message: "Document analysis completed for Bob Johnson",
      type: "success",
      time: "1 hour ago",
      read: true,
      icon: CheckCircle
    },
    {
      id: 4,
      title: "Client Meeting Reminder",
      message: "Meeting with Alice Brown in 30 minutes",
      type: "info",
      time: "2 hours ago",
      read: false,
      icon: Clock
    },
    {
      id: 5,
      title: "System Update",
      message: "New features available in the document viewer",
      type: "info",
      time: "1 day ago",
      read: true,
      icon: Bell
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">
                  Stay updated with your latest activities and alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount} unread
                </Badge>
              )}
              <Button variant="outline">
                Mark All as Read
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Your latest alerts and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                          !notification.read ? 'bg-accent/5' : 'hover:bg-accent/5'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          notification.type === 'success' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{notification.title}</h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                            <div className="flex gap-2">
                              {!notification.read && (
                                <Button variant="ghost" size="sm">
                                  Mark as Read
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
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

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email Notifications</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push Notifications</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS Alerts</span>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Today</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unread</span>
                  <span className="font-semibold text-orange-600">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="font-semibold">23</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  All Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Unread Only
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Document Alerts
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Risk Warnings
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  System Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;

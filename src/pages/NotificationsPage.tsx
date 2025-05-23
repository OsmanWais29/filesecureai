import React from "react";
import { MainHeader } from "@/components/header/MainHeader";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { safeStringCast, safeBooleanCast } from '@/utils/typeGuards';

export const NotificationsPage = () => {
  const mockNotifications = [
    {
      id: "1",
      title: safeStringCast("Document Analysis Complete"),
      message: safeStringCast("Form 47 analysis completed with 3 recommendations"),
      type: safeStringCast("info"),
      priority: safeStringCast("medium"),
      icon: safeStringCast("FileText"),
      read: safeBooleanCast(false),
      action_url: safeStringCast("/documents/form47"),
      created_at: safeStringCast(new Date().toISOString())
    },
    {
      id: "2",
      title: safeStringCast("New Task Assigned"),
      message: safeStringCast("A new task 'Review Client Documents' has been assigned to you"),
      type: safeStringCast("task"),
      priority: safeStringCast("high"),
      icon: safeStringCast("CheckCircle"),
      read: safeBooleanCast(false),
      action_url: safeStringCast("/tasks/123"),
      created_at: safeStringCast(new Date(Date.now() - 86400000).toISOString())
    },
    {
      id: "3",
      title: safeStringCast("Upcoming Meeting Reminder"),
      message: safeStringCast("Reminder: Meeting with John Doe is scheduled for tomorrow at 10:00 AM"),
      type: safeStringCast("meeting"),
      priority: safeStringCast("medium"),
      icon: safeStringCast("Calendar"),
      read: safeBooleanCast(true),
      action_url: safeStringCast("/meetings/456"),
      created_at: safeStringCast(new Date(Date.now() - 172800000).toISOString())
    },
    {
      id: "4",
      title: safeStringCast("Compliance Alert"),
      message: safeStringCast("Critical compliance risks detected in client file ABC. Immediate action required"),
      type: safeStringCast("alert"),
      priority: safeStringCast("critical"),
      icon: safeStringCast("AlertTriangle"),
      read: safeBooleanCast(false),
      action_url: safeStringCast("/compliance/789"),
      created_at: safeStringCast(new Date(Date.now() - 259200000).toISOString())
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <MainSidebar />
      <div className="pl-64">
        <MainHeader />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              <h1 className="text-2xl font-semibold">Notifications</h1>
            </div>
            <Button variant="outline" size="sm">Mark all as read</Button>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <Card key={notification.id} className="border-muted">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
                    <Badge variant="secondary">{notification.priority}</Badge>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs text-muted-foreground">
                      {notification.message}
                    </CardDescription>
                  </CardContent>
                  <div className="flex justify-end p-2">
                    <Link to={notification.action_url}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

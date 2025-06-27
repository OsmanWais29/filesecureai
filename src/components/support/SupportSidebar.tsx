
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  MessageCircle, 
  FileText, 
  ExternalLink,
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

const quickLinks = [
  { title: "Getting Started Guide", icon: BookOpen, href: "#" },
  { title: "Video Tutorials", icon: Video, href: "#" },
  { title: "API Documentation", icon: FileText, href: "#" },
  { title: "Release Notes", icon: TrendingUp, href: "#" },
];

const popularTopics = [
  { title: "Document Upload Issues", replies: 34 },
  { title: "User Management", replies: 28 },
  { title: "PDF Processing", replies: 22 },
  { title: "Security Settings", replies: 18 },
];

const recentActivity = [
  { user: "Sarah M.", action: "answered", topic: "RBAC Configuration", time: "2h ago" },
  { user: "Mike T.", action: "asked", topic: "Bulk Document Import", time: "4h ago" },
  { user: "Lisa K.", action: "commented on", topic: "API Integration", time: "6h ago" },
];

export const SupportSidebar = () => {
  return (
    <div className="space-y-4">
      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickLinks.map((link) => (
            <Button
              key={link.title}
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              asChild
            >
              <a href={link.href} className="flex items-center gap-3">
                <link.icon className="h-4 w-4 text-primary" />
                <span className="text-sm">{link.title}</span>
                <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Popular Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm hover:text-primary cursor-pointer transition-colors">
                {topic.title}
              </span>
              <Badge variant="secondary" className="text-xs">
                {topic.replies}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium">{activity.user}</span>
                <span className="text-muted-foreground">{activity.action}</span>
              </div>
              <div className="text-primary hover:underline cursor-pointer">
                {activity.topic}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {activity.time}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 text-center">
          <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Need More Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Button className="w-full">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

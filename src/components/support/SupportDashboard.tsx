
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  Users, 
  Star,
  ChevronRight,
  Clock
} from "lucide-react";

interface SupportDashboardProps {
  selectedCategory: string;
  searchQuery: string;
}

const supportTopics = [
  {
    id: 1,
    title: "How to upload documents securely",
    category: "Documents",
    replies: 12,
    views: 245,
    lastActivity: "2 hours ago",
    isAnswered: true,
    tags: ["upload", "security", "documents"]
  },
  {
    id: 2,
    title: "Setting up role-based access control",
    category: "Security",
    replies: 8,
    views: 189,
    lastActivity: "4 hours ago",
    isAnswered: true,
    tags: ["rbac", "permissions", "access"]
  },
  {
    id: 3,
    title: "Troubleshooting PDF preview issues",
    category: "Technical",
    replies: 15,
    views: 356,
    lastActivity: "1 day ago",
    isAnswered: false,
    tags: ["pdf", "preview", "troubleshooting"]
  },
  {
    id: 4,
    title: "Client onboarding best practices",
    category: "General",
    replies: 23,
    views: 478,
    lastActivity: "2 days ago",
    isAnswered: true,
    tags: ["onboarding", "clients", "best-practices"]
  },
  {
    id: 5,
    title: "Integration with external audit systems",
    category: "Integration",
    replies: 6,
    views: 134,
    lastActivity: "3 days ago",
    isAnswered: false,
    tags: ["integration", "audit", "external"]
  },
];

const categories = [
  { name: "All", count: 45, icon: MessageSquare },
  { name: "Documents", count: 12, icon: FileText },
  { name: "Security", count: 8, icon: Users },
  { name: "Technical", count: 15, icon: HelpCircle },
  { name: "General", count: 10, icon: Star },
];

export const SupportDashboard = ({ selectedCategory, searchQuery }: SupportDashboardProps) => {
  const filteredTopics = supportTopics.filter(topic => {
    const matchesSearch = !searchQuery || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
      topic.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Support Forum</h1>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            New Topic
          </Button>
        </div>
        
        {/* Categories */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Badge 
              key={category.name}
              variant={selectedCategory === category.name.toLowerCase() ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 px-3 py-1"
            >
              <category.icon className="h-3 w-3 mr-1" />
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>
      </div>

      {/* Topics List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold hover:text-primary transition-colors">
                        {topic.title}
                      </h3>
                      {topic.isAnswered && (
                        <Badge variant="secondary" className="text-xs">
                          Answered
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {topic.replies} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {topic.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {topic.lastActivity}
                      </span>
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No topics found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse different categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

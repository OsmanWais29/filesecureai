
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationItem {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
  isActive?: boolean;
}

interface ConversationHistoryProps {
  isCollapsed?: boolean;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ isCollapsed = false }) => {
  // Mock conversation data - in real app, this would come from a database
  const conversations: ConversationItem[] = [
    {
      id: "1",
      title: "Form 47 Analysis Help",
      timestamp: "2 hours ago",
      preview: "How do I analyze Form 47 for bankruptcy...",
      isActive: true
    },
    {
      id: "2", 
      title: "OSB Compliance Questions",
      timestamp: "Yesterday",
      preview: "What are the latest OSB requirements...",
    },
    {
      id: "3",
      title: "Document Upload Issues",
      timestamp: "2 days ago", 
      preview: "I'm having trouble uploading documents...",
    },
    {
      id: "4",
      title: "Risk Assessment Setup",
      timestamp: "3 days ago",
      preview: "How do I configure risk assessments...",
    },
    {
      id: "5",
      title: "AI Training Questions",
      timestamp: "1 week ago",
      preview: "What documents should I use to train...",
    }
  ];

  if (isCollapsed) {
    return (
      <div className="p-2">
        <div className="flex flex-col gap-1">
          {conversations.slice(0, 3).map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 w-10 p-0 flex items-center justify-center hover:bg-accent",
                conversation.isActive && "bg-accent"
              )}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground mb-2">Recent Conversations</h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map((conversation) => (
            <Button
              key={conversation.id}
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-3 mb-1 text-left hover:bg-accent transition-colors group",
                conversation.isActive && "bg-accent hover:bg-accent"
              )}
            >
              <div className="flex items-start gap-3 w-full">
                <MessageSquare className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate mb-1">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mb-1">
                    {conversation.preview}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {conversation.timestamp}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle conversation options
                  }}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

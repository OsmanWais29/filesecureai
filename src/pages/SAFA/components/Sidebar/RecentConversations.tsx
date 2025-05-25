
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock } from "lucide-react";

export const RecentConversations = () => {
  // Mock data for recent conversations
  const recentChats = [
    { id: 1, title: "Form 47 Analysis", time: "2 hours ago", module: "document" },
    { id: 2, title: "OSB Compliance", time: "Yesterday", module: "legal" },
    { id: 3, title: "Client Consultation", time: "2 days ago", module: "client" },
  ];

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Recent Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start h-auto p-2 text-left"
                onClick={() => console.log("Load conversation:", chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {chat.time}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

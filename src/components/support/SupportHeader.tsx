
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare } from "lucide-react";

interface SupportHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setShowChatbot: (show: boolean) => void;
}

export const SupportHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  setShowChatbot 
}: SupportHeaderProps) => {
  return (
    <div className="border-b bg-background p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search support topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

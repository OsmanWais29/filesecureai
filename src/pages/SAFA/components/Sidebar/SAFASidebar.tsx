
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConversationHistory } from "./ConversationHistory";
import { TrainingPanel } from "./TrainingPanel";

interface SAFASidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SAFASidebar: React.FC<SAFASidebarProps> = ({ isCollapsed, onToggle }) => {
  const handleNewChat = () => {
    // This would trigger a new chat in the main interface
    window.location.reload(); // Simple implementation for now
  };

  return (
    <div className={cn(
      "h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 relative flex-shrink-0 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-sm flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">SecureFiles AI</span>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleNewChat}
          className={cn(
            "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
            isCollapsed ? "h-10 w-10 p-0" : "w-full justify-center"
          )}
          size={isCollapsed ? "sm" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-hidden">
        <ConversationHistory isCollapsed={isCollapsed} />
      </div>

      {/* Training Panel */}
      <div className="border-t border-gray-200">
        <TrainingPanel isCollapsed={isCollapsed} />
      </div>

      {/* Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 rounded-full border shadow-md bg-white hover:bg-gray-50"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default SAFASidebar;

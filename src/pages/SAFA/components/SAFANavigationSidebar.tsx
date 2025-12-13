
import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Scale,
  Calendar,
  Wallet,
  FileCode,
  Plus,
  History,
  MessageSquare,
} from "lucide-react";

export type SAFAModule = 
  | "overview" 
  | "documents" 
  | "creditors" 
  | "claims" 
  | "meetings" 
  | "distributions" 
  | "osb-forms";

interface SAFANavigationSidebarProps {
  activeModule: SAFAModule;
  onModuleChange: (module: SAFAModule) => void;
  onNewConversation: () => void;
  conversationHistory: { id: string; title: string; timestamp: string }[];
}

const modules = [
  { id: "overview" as SAFAModule, label: "Overview", icon: LayoutDashboard },
  { id: "documents" as SAFAModule, label: "Documents", icon: FileText, badge: 3 },
  { id: "creditors" as SAFAModule, label: "Creditors", icon: Users, badge: 12 },
  { id: "claims" as SAFAModule, label: "Claims", icon: Scale, badge: 5 },
  { id: "meetings" as SAFAModule, label: "Meetings", icon: Calendar },
  { id: "distributions" as SAFAModule, label: "Distributions", icon: Wallet },
  { id: "osb-forms" as SAFAModule, label: "OSB Forms", icon: FileCode, badge: 2 },
];

export const SAFANavigationSidebar: React.FC<SAFANavigationSidebarProps> = ({
  activeModule,
  onModuleChange,
  onNewConversation,
  conversationHistory,
}) => {
  return (
    <div className="w-56 border-r bg-card flex flex-col h-full">
      {/* New Conversation Button */}
      <div className="p-3 border-b">
        <Button onClick={onNewConversation} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Estate Modules */}
      <div className="p-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Estate Modules
        </h3>
        <nav className="space-y-1">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{module.label}</span>
                </div>
                {module.badge && (
                  <Badge 
                    variant={isActive ? "secondary" : "outline"} 
                    className="text-xs h-5 px-1.5"
                  >
                    {module.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conversation History */}
      <div className="flex-1 flex flex-col min-h-0 border-t">
        <div className="p-3 pb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <History className="h-3 w-3" />
            Recent Conversations
          </h3>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-3">
            {conversationHistory.map((conv) => (
              <button
                key={conv.id}
                className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{conv.title}</div>
                    <div className="text-xs text-muted-foreground">{conv.timestamp}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

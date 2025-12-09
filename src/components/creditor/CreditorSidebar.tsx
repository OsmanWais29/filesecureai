import React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Calendar,
  PieChart,
  FileText,
  Shield,
  Settings,
} from "lucide-react";

interface CreditorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "creditors", label: "Creditors", icon: Users },
  { id: "claims", label: "Claims", icon: FileCheck },
  { id: "meetings", label: "Meetings", icon: Calendar },
  { id: "distribution", label: "Distribution", icon: PieChart },
  { id: "forms", label: "OSB Forms", icon: FileText },
  { id: "audit", label: "Audit Trail", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
];

export const CreditorSidebar: React.FC<CreditorSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="w-56 border-r border-border bg-card h-full flex-shrink-0">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">Navigation</h3>
      </div>
      <ScrollArea className="h-[calc(100%-57px)]">
        <nav className="p-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
};

import React from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Calendar,
  Wallet,
  FileText,
} from "lucide-react";

export type ModuleTab =
  | "overview" 
  | "creditors" 
  | "claims" 
  | "meetings" 
  | "distribution" 
  | "osb-forms" 
  | "safa" 
  | "audit";

interface ModuleTabsProps {
  activeTab: ModuleTab;
  onTabChange: (tab: ModuleTab) => void;
}

const tabs: { id: ModuleTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "creditors", label: "Creditors", icon: Users },
  { id: "claims", label: "Claims", icon: FileCheck },
  { id: "meetings", label: "Meetings", icon: Calendar },
  { id: "distribution", label: "Distribution", icon: Wallet },
  { id: "osb-forms", label: "OSB Forms", icon: FileText },
];

export const ModuleTabs = ({ activeTab, onTabChange }: ModuleTabsProps) => {
  return (
    <div className="h-11 border-b bg-background flex items-center px-4 gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

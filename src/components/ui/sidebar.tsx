
import React from "react";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  children?: React.ReactNode;
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  children, 
  isCollapsed,
  onToggle,
  className 
}) => {
  return (
    <div 
      className={cn(
        "h-full border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="h-full overflow-y-auto">
        {children}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onToggle}
        className="absolute bottom-4 right-0 translate-x-1/2 rounded-full border shadow-md"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
};

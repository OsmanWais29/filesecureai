
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./index";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SAFASidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const SAFASidebar: React.FC<SAFASidebarProps> = ({ isCollapsed, onToggle }) => {
  const [activeModule, setActiveModule] = React.useState<'document' | 'legal' | 'help' | 'client'>('document');

  const handleUploadComplete = async (documentId: string) => {
    console.log("Document uploaded successfully:", documentId);
  };

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--safa-sidebar-width', 
      isCollapsed ? '4rem' : '20rem'
    );

    return () => {
      document.documentElement.style.removeProperty('--safa-sidebar-width');
    };
  }, [isCollapsed]);

  return (
    <div className={cn(
      "h-full border-r bg-background transition-all duration-300 relative flex-shrink-0",
      isCollapsed ? "w-16" : "w-80"
    )}>
      <div className="h-full flex flex-col">
        <Sidebar 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          onUploadComplete={handleUploadComplete}
          isCollapsed={isCollapsed}
        />
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 rounded-full border shadow-md bg-background hover:bg-muted"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default SAFASidebar;


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
    // Add your logic here
  };

  // Set CSS custom property for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--safa-sidebar-width', 
      isCollapsed ? '4rem' : '16rem'
    );

    return () => {
      document.documentElement.style.removeProperty('--safa-sidebar-width');
    };
  }, [isCollapsed]);

  return (
    <div className={cn(
      "h-full border-r bg-background transition-all duration-300 relative",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onUploadComplete={handleUploadComplete}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onToggle}
        className="absolute bottom-4 right-0 translate-x-1/2 rounded-full border shadow-md"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default SAFASidebar;

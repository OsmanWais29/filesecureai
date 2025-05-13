
import React from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./index";

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

  return (
    <div className={cn(
      "h-full transition-all duration-300",
      isCollapsed ? "w-16" : "w-80"
    )}>
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default SAFASidebar;

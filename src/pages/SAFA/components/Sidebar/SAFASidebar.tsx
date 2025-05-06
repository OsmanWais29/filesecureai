
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "../Sidebar";

interface SAFASidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const SAFASidebar = ({ collapsed, setCollapsed }: SAFASidebarProps) => {
  const [activeModule, setActiveModule] = useState<'document' | 'legal' | 'help' | 'client'>('document');

  // Handle document upload completion
  const handleUploadComplete = async (documentId: string) => {
    console.log("Document uploaded successfully:", documentId);
    // Any additional logic after document upload
  };

  // Handle sidebar collapse toggling
  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    
    // Emit custom event for the MainLayout
    const event = new CustomEvent('safaSidebarCollapse', { 
      detail: { collapsed: newCollapsedState } 
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="h-full flex">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onUploadComplete={handleUploadComplete}
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 absolute top-4 left-60 z-10"
        onClick={toggleSidebar}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
    </div>
  );
};

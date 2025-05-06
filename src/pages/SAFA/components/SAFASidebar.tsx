
import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";

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

  return (
    <Sidebar
      activeModule={activeModule}
      setActiveModule={setActiveModule}
      onUploadComplete={handleUploadComplete}
    />
  );
};

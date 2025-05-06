
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Sidebar } from "./components/Sidebar";
import { SAFAContent } from "./components/SAFAContent";

const SAFAPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState<'document' | 'legal' | 'help' | 'client'>('document');

  // Function to handle sidebar collapse
  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    
    // Emit custom event for MainLayout
    const event = new CustomEvent('safaSidebarCollapse', { 
      detail: { collapsed } 
    });
    window.dispatchEvent(event);
  };

  // Handle document upload completion
  const handleUploadComplete = async (documentId: string) => {
    console.log("Document uploaded successfully:", documentId);
    // Any additional logic after document upload
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          onUploadComplete={handleUploadComplete}
        />
        <div 
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sidebarCollapsed ? "safa-content-with-collapsed-sidebar" : "safa-content-with-sidebar"
          }`}
        >
          <SAFAContent sidebarCollapsed={sidebarCollapsed} />
        </div>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;

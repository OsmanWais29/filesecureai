
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SAFAHeader } from "./components/SAFAHeader";
import { SAFASidebar } from "./components/Sidebar/SAFASidebar";
import { SAFAContent } from "./components/SAFAContent";

const SAFAPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Function to handle sidebar collapse
  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    
    // Emit custom event for MainLayout
    const event = new CustomEvent('safaSidebarCollapse', { 
      detail: { collapsed } 
    });
    window.dispatchEvent(event);
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <SAFASidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={handleSidebarCollapse} 
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

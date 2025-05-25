
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import SAFAHeader from "./components/SAFAHeader";
import SAFASidebar from "./components/Sidebar/SAFASidebar";
import SAFAContent from "./components/SAFAContent";

const SAFAPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const customEvent = new CustomEvent('safaSidebarCollapse', { 
      detail: { collapsed: sidebarCollapsed } 
    });
    window.dispatchEvent(customEvent);

    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [sidebarCollapsed]);

  return (
    <MainLayout>
      <div className="flex h-full flex-col bg-gradient-to-br from-background to-muted/20">
        <SAFAHeader toggleSidebar={toggleSidebar} />
        <div className="flex flex-1 overflow-hidden">
          <SAFASidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
            <SAFAContent />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;

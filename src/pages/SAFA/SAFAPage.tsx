
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import SAFAHeader from "./components/SAFAHeader";
import SAFASidebar from "./components/Sidebar/SAFASidebar";
import SAFAContent from "./components/SAFAContent";

const SAFAPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
        <SAFAHeader toggleSidebar={toggleSidebar} />
        <div className="flex flex-1 overflow-hidden">
          {/* Simplified sidebar usage */}
          <div className={`${sidebarCollapsed ? 'w-0 md:w-16' : 'w-64'} transition-all duration-300 border-r`}>
            <SAFASidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          </div>
          <SAFAContent />
        </div>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;


import { useState } from "react";
import { ChatInterface } from "./components/ChatInterface";
import SAFASidebar from "./components/Sidebar/SAFASidebar";
import { MainLayout } from "@/components/layout/MainLayout";

const SAFAPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <MainLayout>
      <div className="h-full flex bg-white">
        <SAFASidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface />
        </div>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;


import { useState } from "react";
import { ChatInterface } from "./components/ChatInterface";
import SAFASidebar from "./components/Sidebar/SAFASidebar";

const SAFAPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-white">
      <SAFASidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterface />
      </div>
    </div>
  );
};

export default SAFAPage;

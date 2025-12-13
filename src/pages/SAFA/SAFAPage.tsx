
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useConversations } from "./hooks/useConversations";
import { SAFAEstateContext } from "./components/SAFAEstateContext";
import { SAFANavigationSidebar, SAFAModule } from "./components/SAFANavigationSidebar";
import { SAFAConversationPanel } from "./components/SAFAConversationPanel";
import { SAFAContextDrawer } from "./components/SAFAContextDrawer";

interface Estate {
  id: string;
  name: string;
  estateNumber: string;
  trustee: string;
  status: "active" | "closed" | "pending";
  riskScore: number;
  type: string;
}

const mockEstates: Estate[] = [
  { id: "1", name: "John Smith", estateNumber: "CP #31-2847593", trustee: "David Miller", status: "active", riskScore: 72, type: "Consumer Proposal" },
  { id: "2", name: "Sarah Johnson", estateNumber: "BK #31-1928374", trustee: "David Miller", status: "active", riskScore: 45, type: "Bankruptcy" },
  { id: "3", name: "ABC Corporation", estateNumber: "D1 #31-8472615", trustee: "Lisa Chen", status: "pending", riskScore: 88, type: "Division I Proposal" },
  { id: "4", name: "Robert Williams", estateNumber: "BK #31-7462951", trustee: "David Miller", status: "closed", riskScore: 12, type: "Bankruptcy" },
];

const mockConversationHistory = [
  { id: "1", title: "Creditor import review", timestamp: "2 hours ago" },
  { id: "2", title: "Form 31 preparation", timestamp: "Yesterday" },
  { id: "3", title: "CRA claim dispute", timestamp: "2 days ago" },
  { id: "4", title: "Distribution calculation", timestamp: "1 week ago" },
];

const SAFAPage = () => {
  const [currentEstate, setCurrentEstate] = useState<Estate>(mockEstates[0]);
  const [activeModule, setActiveModule] = useState<SAFAModule>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [contextItem, setContextItem] = useState<any>(null);

  const {
    categoryMessages,
    handleSendMessage,
    isProcessing,
    loadConversationHistory,
  } = useConversations("document");

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory("document");
  }, [loadConversationHistory]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim()) {
        handleSendMessage(inputMessage);
        setInputMessage("");
      }
    }
  };

  const handleSend = () => {
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleNewConversation = () => {
    // Clear messages for new conversation
    window.location.reload();
  };

  const messages = categoryMessages["document"] || [];

  return (
    <MainLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Top Bar - Estate Context */}
        <SAFAEstateContext
          currentEstate={currentEstate}
          estates={mockEstates}
          onEstateChange={setCurrentEstate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Navigation */}
          <SAFANavigationSidebar
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            onNewConversation={handleNewConversation}
            conversationHistory={mockConversationHistory}
          />

          {/* Center Panel - Conversation */}
          <SAFAConversationPanel
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSend}
            handleKeyPress={handleKeyPress}
            isProcessing={isProcessing}
            activeModule={activeModule}
            estateName={currentEstate?.name || ""}
          />

          {/* Right Panel - Context Drawer */}
          <SAFAContextDrawer
            activeModule={activeModule}
            contextItem={contextItem}
            onClose={() => setContextItem(null)}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default SAFAPage;

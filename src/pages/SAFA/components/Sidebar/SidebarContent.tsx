
import { useState, useEffect } from "react";
import { useConversations } from "../../hooks/useConversations";
import { CategorySelector } from "./CategorySelector";
import { DocumentModuleContent } from "./ModuleContents/DocumentModuleContent";
import { LegalModuleContent } from "./ModuleContents/LegalModuleContent";
import { HelpModuleContent } from "./ModuleContents/HelpModuleContent";
import { ClientConversation } from "../ClientConnect/ClientConversation";
import { RecentConversations } from "./RecentConversations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarContentProps {
  activeModule: 'document' | 'legal' | 'help' | 'client';
  setActiveModule: (module: 'document' | 'legal' | 'help' | 'client') => void;
  onUploadComplete: (documentId: string) => Promise<void>;
}

export const Sidebar = ({ activeModule, setActiveModule, onUploadComplete }: SidebarContentProps) => {
  const { categoryMessages, handleSendMessage, isProcessing } = useConversations(activeModule);
  const [showConversation, setShowConversation] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleStartConsultation = async () => {
    setActiveModule('client');
    setShowConversation(true);
    await handleSendMessage("Hello, I'd like to start a consultation.");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleMessageSend = () => {
    handleSendMessage(inputMessage);
    setInputMessage("");
  };

  // Emit sidebar collapse event
  useEffect(() => {
    const event = new CustomEvent('safaSidebarCollapse', { 
      detail: { collapsed: isSidebarCollapsed } 
    });
    window.dispatchEvent(event);
    
    // Small delay to let the transition complete
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed]);

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'document':
        return (
          <DocumentModuleContent
            messages={categoryMessages.document}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleKeyPress={handleKeyPress}
            handleMessageSend={handleMessageSend}
            isProcessing={isProcessing}
            onUploadComplete={onUploadComplete}
          />
        );
      case 'legal':
        return (
          <LegalModuleContent
            messages={categoryMessages.legal}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleKeyPress={handleKeyPress}
            handleMessageSend={handleMessageSend}
            isProcessing={isProcessing}
          />
        );
      case 'help':
        return (
          <HelpModuleContent
            messages={categoryMessages.help}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleKeyPress={handleKeyPress}
            handleMessageSend={handleMessageSend}
            isProcessing={isProcessing}
          />
        );
      case 'client':
        return showConversation && (
          <ClientConversation
            messages={categoryMessages.client}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleMessageSend}
            handleKeyPress={handleKeyPress}
            isProcessing={isProcessing}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <aside className={cn(
        "border-r bg-muted/30 overflow-y-auto h-full transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="p-4 space-y-4">
          {!isSidebarCollapsed ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Categories</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsSidebarCollapsed(true)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <CategorySelector 
                activeModule={activeModule} 
                setActiveModule={setActiveModule}
                handleStartConsultation={handleStartConsultation}
                showConversation={showConversation}
                isProcessing={isProcessing}
                onUploadComplete={onUploadComplete}
              />
              <RecentConversations />
            </>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsSidebarCollapsed(false)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <CategorySelector 
                activeModule={activeModule} 
                setActiveModule={setActiveModule}
                handleStartConsultation={handleStartConsultation}
                showConversation={showConversation}
                isProcessing={isProcessing}
                onUploadComplete={onUploadComplete}
                collapsed={true}
              />
            </div>
          )}
        </div>
      </aside>

      <div className={cn(
        "flex-1 transition-all duration-300",
        isSidebarCollapsed ? "ml-0" : "ml-0"
      )}>
        {renderModuleContent()}
      </div>
    </div>
  );
};

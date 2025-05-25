
import { useState, useEffect } from "react";
import { useConversations } from "../../hooks/useConversations";
import { CategorySelector } from "./CategorySelector";
import { DocumentModuleContent } from "./ModuleContents/DocumentModuleContent";
import { LegalModuleContent } from "./ModuleContents/LegalModuleContent";
import { HelpModuleContent } from "./ModuleContents/HelpModuleContent";
import { ClientConversation } from "../ClientConnect/ClientConversation";
import { RecentConversations } from "./RecentConversations";

interface SidebarContentProps {
  activeModule: 'document' | 'legal' | 'help' | 'client';
  setActiveModule: (module: 'document' | 'legal' | 'help' | 'client') => void;
  onUploadComplete: (documentId: string) => Promise<void>;
  isCollapsed?: boolean;
}

export const Sidebar = ({ activeModule, setActiveModule, onUploadComplete, isCollapsed = false }: SidebarContentProps) => {
  const { categoryMessages, handleSendMessage, isProcessing } = useConversations(activeModule);
  const [showConversation, setShowConversation] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

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

  if (isCollapsed) {
    return (
      <div className="h-full p-2">
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
    );
  }

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'document':
        return (
          <DocumentModuleContent
            messages={categoryMessages.document || []}
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
            messages={categoryMessages.legal || []}
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
            messages={categoryMessages.help || []}
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
            messages={categoryMessages.client || []}
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
    <div className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg mb-4">AI Modules</h3>
          <CategorySelector 
            activeModule={activeModule} 
            setActiveModule={setActiveModule}
            handleStartConsultation={handleStartConsultation}
            showConversation={showConversation}
            isProcessing={isProcessing}
            onUploadComplete={onUploadComplete}
          />
        </div>
        
        <div className="flex-1 overflow-hidden">
          {renderModuleContent()}
        </div>
        
        <div className="p-4 border-t">
          <RecentConversations />
        </div>
      </div>
    </div>
  );
};

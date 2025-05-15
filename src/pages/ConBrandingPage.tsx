
import { useState } from "react";
import { MainHeader } from "@/components/header/MainHeader";
import { MainSidebar } from "@/components/layout/MainSidebar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ClientAssistantPanel } from "./SAFA/components/ClientConnect/ClientAssistantPanel";
import { Sidebar } from "./SAFA/components/Sidebar";
import { ConversationView } from "./SAFA/components/ConversationView";
import { useConversations } from "./SAFA/hooks/useConversations";

export const ConBrandingPage = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [activeModule, setActiveModule] = useState<'document' | 'legal' | 'help' | 'client'>('document');
  const [showChat, setShowChat] = useState(false);
  const { toast } = useToast();
  
  const {
    categoryMessages,
    isProcessing,
    handleSendMessage,
    loadConversationHistory
  } = useConversations(activeModule);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleStartConversation = () => {
    setShowChat(true);
  };

  const handleViewHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('type', activeModule)
        .order('created_at', { ascending: false });

      if (error) throw error;

      toast({
        title: "Conversation History",
        description: `Found ${data.length} previous conversations for ${activeModule} module.`,
      });

      // Load the first conversation if available
      if (data && data.length > 0) {
        await loadConversationHistory(data[0].id, activeModule);
      }

      setShowChat(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversation history."
      });
    }
  };

  const renderMainContent = () => {
    if (activeModule === 'client' && !showChat) {
      return (
        <ClientAssistantPanel 
          onStartConversation={handleStartConversation}
          onViewHistory={handleViewHistory}
        />
      );
    }

    return (
      <ConversationView 
        messages={categoryMessages[activeModule] || []}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={() => {
          handleSendMessage(inputMessage);
          setInputMessage("");
        }}
        handleKeyPress={handleKeyPress}
        isProcessing={isProcessing}
      />
    );
  };

  return (
    <div className="min-h-screen h-screen flex overflow-hidden bg-background">
      <MainSidebar />
      <div className="flex-1 flex flex-col pl-64">
        <MainHeader />
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            <Sidebar 
              activeModule={activeModule}
              setActiveModule={(module) => {
                setActiveModule(module);
                setShowChat(module !== 'client');
              }}
              onUploadComplete={async (documentId: string) => {
                setActiveModule('document');
              }}
            />
            <main className="flex-1 flex flex-col overflow-hidden">
              {renderMainContent()}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConBrandingPage;

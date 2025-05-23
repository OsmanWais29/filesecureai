
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations } from "../hooks/useConversations";
import { ConversationView } from "./ConversationView";
import { ClientAssistantPanel } from "./ClientConnect/ClientAssistantPanel";
import { FileTextIcon, BookOpen, HelpCircle, Users } from "lucide-react";

const SAFAContent = () => {
  const [activeTab, setActiveTab] = useState<'document' | 'legal' | 'help' | 'client'>('document');
  const [selectedClient, setSelectedClient] = useState<string>("");
  const { categoryMessages, handleSendMessage, isProcessing } = useConversations(activeTab);
  const [inputMessage, setInputMessage] = useState("");

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

  // Convert client messages to match ConversationView expectations
  const getMessagesForTab = (tab: string) => {
    const messages = categoryMessages[tab] || [];
    return messages.map(msg => ({
      ...msg,
      type: 'text' as const,
      module: tab
    }));
  };

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <Card className="border shadow-sm h-full overflow-hidden">
        <CardHeader className="border-b bg-muted/20 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SecureFiles AI Assistant</CardTitle>
              <CardDescription>Get assistance with documents, legal questions, and client interactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="h-[calc(100%-4rem)]"
        >
          <div className="border-b px-4 bg-background">
            <TabsList className="h-12">
              <TabsTrigger value="document" className="flex items-center gap-2">
                <FileTextIcon className="h-4 w-4" />
                <span>Document Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="legal" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Legal Advisory</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Training</span>
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Client Connect</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-0 h-[calc(100%-3rem)]">
            <TabsContent value="document" className="mt-0 h-full">
              <ConversationView
                messages={getMessagesForTab('document')}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSend}
                handleKeyPress={handleKeyPress}
                isProcessing={isProcessing}
              />
            </TabsContent>
            
            <TabsContent value="legal" className="mt-0 h-full">
              <ConversationView
                messages={getMessagesForTab('legal')}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSend}
                handleKeyPress={handleKeyPress}
                isProcessing={isProcessing}
              />
            </TabsContent>
            
            <TabsContent value="help" className="mt-0 h-full">
              <ConversationView
                messages={getMessagesForTab('help')}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSend}
                handleKeyPress={handleKeyPress}
                isProcessing={isProcessing}
              />
            </TabsContent>
            
            <TabsContent value="client" className="mt-0 h-full">
              <ClientAssistantPanel 
                activeClient={selectedClient}
                onSelectClient={setSelectedClient}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SAFAContent;

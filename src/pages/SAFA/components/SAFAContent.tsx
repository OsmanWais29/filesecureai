
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversations } from "../hooks/useConversations";
import { ConversationView } from "./ConversationView";
import { FileTextIcon, BookOpen, HelpCircle, Users } from "lucide-react";

const SAFAContent = () => {
  const [activeTab, setActiveTab] = useState<'document' | 'legal' | 'help' | 'client'>('document');
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

  const getMessagesForTab = (tab: string) => {
    const messages = categoryMessages[tab] || [];
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
      module: tab
    }));
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="border-0 shadow-none h-full overflow-hidden bg-transparent">
        <CardHeader className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">SecureFiles AI Assistant</CardTitle>
              <CardDescription>Intelligent document analysis and legal advisory system</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          className="h-[calc(100%-5rem)] flex flex-col"
        >
          <div className="border-b px-6 bg-background">
            <TabsList className="h-12 w-full justify-start">
              <TabsTrigger value="document" className="flex items-center gap-2 px-6">
                <FileTextIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Document Analysis</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="legal" className="flex items-center gap-2 px-6">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Legal Advisory</span>
                <span className="sm:hidden">Legal</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex items-center gap-2 px-6">
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help & Training</span>
                <span className="sm:hidden">Help</span>
              </TabsTrigger>
              <TabsTrigger value="client" className="flex items-center gap-2 px-6">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Client Connect</span>
                <span className="sm:hidden">Client</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-0 flex-1 overflow-hidden">
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
              <ConversationView
                messages={getMessagesForTab('client')}
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSendMessage={handleSend}
                handleKeyPress={handleKeyPress}
                isProcessing={isProcessing}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SAFAContent;

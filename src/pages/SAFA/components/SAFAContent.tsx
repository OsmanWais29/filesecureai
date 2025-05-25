
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversations } from "../hooks/useConversations";
import { ConversationView } from "./ConversationView";

const SAFAContent = () => {
  const [activeTab] = useState<'document' | 'legal' | 'help' | 'client'>('document');
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

  const getMessagesForTab = () => {
    const messages = categoryMessages[activeTab] || [];
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
      module: activeTab
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
        
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="h-full">
            <ConversationView
              messages={getMessagesForTab()}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSend}
              handleKeyPress={handleKeyPress}
              isProcessing={isProcessing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAFAContent;

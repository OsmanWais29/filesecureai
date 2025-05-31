
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare } from "lucide-react";
import { useConversations } from "../hooks/useConversations";
import { ConversationView } from "./ConversationView";
import { cn } from "@/lib/utils";

type ChatMode = 'help' | 'general';

export const ChatInterface = () => {
  const [chatMode, setChatMode] = useState<ChatMode>('general');
  const { categoryMessages, handleSendMessage, isProcessing } = useConversations('help');
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

  const getMessagesForChat = () => {
    const messages = categoryMessages.help || [];
    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      timestamp: msg.timestamp,
      module: 'help'
    }));
  };

  const welcomeMessage = chatMode === 'help' 
    ? "Hello! I'm your AI training assistant. I can help you learn how to use SecureFiles AI, explain features, and provide guidance on best practices for document management and bankruptcy procedures."
    : "Hello! I'm SecureFiles AI Assistant. How can I help you today?";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">SecureFiles AI Assistant</h1>
            <p className="text-muted-foreground">Intelligent document analysis and legal advisory system</p>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={chatMode === 'general' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatMode('general')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              General Chat
            </Button>
            <Button
              variant={chatMode === 'help' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatMode('help')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Training & Help
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          {getMessagesForChat().length === 0 ? (
            // Welcome Screen
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center space-y-6 max-w-2xl">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  {chatMode === 'help' ? (
                    <BookOpen className="h-8 w-8 text-primary" />
                  ) : (
                    <MessageSquare className="h-8 w-8 text-primary" />
                  )}
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    {chatMode === 'help' ? 'Training & Help Center' : 'SecureFiles AI Assistant'}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {welcomeMessage}
                  </p>
                </div>

                {chatMode === 'help' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setInputMessage("How do I upload documents?")}>
                      <CardContent className="p-0">
                        <h3 className="font-medium mb-2">Document Upload</h3>
                        <p className="text-sm text-muted-foreground">Learn how to upload and manage documents</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setInputMessage("What are the different bankruptcy forms?")}>
                      <CardContent className="p-0">
                        <h3 className="font-medium mb-2">Bankruptcy Forms</h3>
                        <p className="text-sm text-muted-foreground">Understanding Forms 1-96 and their purposes</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setInputMessage("How does risk assessment work?")}>
                      <CardContent className="p-0">
                        <h3 className="font-medium mb-2">Risk Assessment</h3>
                        <p className="text-sm text-muted-foreground">Learn about AI-powered risk analysis</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setInputMessage("How to manage user permissions?")}>
                      <CardContent className="p-0">
                        <h3 className="font-medium mb-2">User Management</h3>
                        <p className="text-sm text-muted-foreground">Managing roles and access control</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Chat View
            <ConversationView
              messages={getMessagesForChat()}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              handleSendMessage={handleSend}
              handleKeyPress={handleKeyPress}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </div>
    </div>
  );
};

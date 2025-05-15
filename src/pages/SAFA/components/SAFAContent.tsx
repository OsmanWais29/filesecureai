
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Scale, BookOpen, Users } from "lucide-react";
import { ChatMessage } from "../types";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuthState";
import { ChatMessage as MessageComponent } from "../components/ChatMessage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Define modules with their icons
const modules = [
  { id: "document", name: "Document Analysis", icon: FileText },
  { id: "legal", name: "Legal & Regulatory", icon: Scale },
  { id: "help", name: "Training & Help", icon: BookOpen },
  { id: "client", name: "Client Connect", icon: Users },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  document: [{
    id: '1',
    content: "Welcome to Document Management. I can help you analyze, organize, and manage your documents. How can I assist you today?",
    type: 'assistant',
    timestamp: new Date(),
    module: 'document'
  }],
  legal: [{
    id: '1',
    content: "Welcome to Legal Advisory. I can help you with OSB regulations, BIA acts, and legal compliance. How can I assist you?",
    type: 'assistant',
    timestamp: new Date(),
    module: 'legal'
  }],
  help: [{
    id: '1',
    content: "Welcome to Training & Help. I can provide guidance on using the system and best practices. What would you like to learn about?",
    type: 'assistant',
    timestamp: new Date(),
    module: 'help'
  }],
  client: [{
    id: '1',
    content: "Welcome to AI Client Assistant. How can I help you connect with and understand your clients better today?",
    type: 'assistant',
    timestamp: new Date(),
    module: 'client'
  }]
};

const SAFAContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("document");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthState();

  // Load conversations from localStorage on component mount
  useEffect(() => {
    const loadSavedMessages = () => {
      const savedMessages: Record<string, ChatMessage[]> = {};
      
      modules.forEach(module => {
        const key = `${module.id}_messages`;
        const saved = localStorage.getItem(key);
        if (saved) {
          savedMessages[module.id] = JSON.parse(saved);
        } else {
          savedMessages[module.id] = INITIAL_MESSAGES[module.id];
        }
      });
      
      setMessages(savedMessages);
    };
    
    loadSavedMessages();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      type: 'user',
      timestamp: new Date(),
      module: activeTab
    };
    
    // Update messages with user input
    const updatedMessages = {
      ...messages,
      [activeTab]: [...messages[activeTab], newUserMessage]
    };
    
    setMessages(updatedMessages);
    setInputMessage("");
    
    try {
      // In a real app, you would call an AI service here
      // This is a placeholder for the actual API call
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I understand your question about "${inputMessage}". As this is a demo version, I can provide basic assistance. In the full version, I would give a detailed response based on the ${activeTab} module.`,
          type: 'assistant',
          timestamp: new Date(),
          module: activeTab
        };
        
        const finalMessages = {
          ...updatedMessages,
          [activeTab]: [...updatedMessages[activeTab], assistantMessage]
        };
        
        setMessages(finalMessages);
        
        // Save to localStorage
        localStorage.setItem(`${activeTab}_messages`, JSON.stringify(finalMessages[activeTab]));
        
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your request. Please try again."
      });
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <Card className="border shadow-sm h-full flex flex-col">
        <CardContent className="p-6 flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="mb-4 grid grid-cols-4">
              {modules.map(module => (
                <TabsTrigger key={module.id} value={module.id} className="flex gap-2">
                  <module.icon className="h-4 w-4" />
                  {module.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {modules.map(module => (
              <TabsContent 
                key={module.id} 
                value={module.id} 
                className="space-y-4 flex-1 flex flex-col"
              >
                <h2 className="text-2xl font-semibold">{module.name} AI Assistant</h2>
                
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages[module.id].map(message => (
                    <MessageComponent key={message.id} message={message} />
                  ))}
                </div>
                
                <div className="mt-auto pt-4 border-t">
                  <div className="flex items-start gap-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={`Ask the ${module.name} assistant something...`}
                      className="flex-1 min-h-[80px]"
                      disabled={isProcessing}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isProcessing}
                    >
                      {isProcessing ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAFAContent;

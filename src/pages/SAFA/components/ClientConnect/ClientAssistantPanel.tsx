
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChatMessage as ChatMessageType } from "../../types";
import { useConversations } from "../../hooks/useConversations";
import { ConversationView } from "../ConversationView";
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, User, ArrowRight } from 'lucide-react';

interface ClientAssistantPanelProps {
  activeClient?: string;
  onSelectClient?: (clientId: string) => void;
}

export const ClientAssistantPanel = ({
  activeClient,
  onSelectClient
}: ClientAssistantPanelProps) => {
  const { categoryMessages, handleSendMessage, isProcessing, loadConversationHistory } = useConversations("client");
  const [inputMessage, setInputMessage] = useState("");
  const [clients] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'pending' },
    { id: '3', name: 'Robert Johnson', email: 'robert@example.com', status: 'inactive' },
  ]);

  useEffect(() => {
    if (activeClient) {
      loadConversationHistory(activeClient, 'client').catch(console.error);
    }
  }, [activeClient, loadConversationHistory]);

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

  if (!activeClient) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Select a Client</span>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Please select a client to start a conversation with the AI assistant.
        </p>
        
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {clients.map(client => (
            <Card 
              key={client.id}
              className="p-4 hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => onSelectClient && onSelectClient(client.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">{client.email}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const currentClient = clients.find(c => c.id === activeClient);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{currentClient?.name}</div>
              <div className="text-xs text-muted-foreground">{currentClient?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onSelectClient && onSelectClient('')}>
              Change Client
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ConversationView 
          messages={categoryMessages.client || []}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          handleSendMessage={handleSend}
          handleKeyPress={handleKeyPress}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

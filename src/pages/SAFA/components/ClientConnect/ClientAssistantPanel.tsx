
import React, { useState } from 'react';
import { useConversations } from '../../hooks/useConversations';
import { ConversationView } from '../ConversationView';
import { ClientOverview } from './ClientOverview';

interface ClientAssistantPanelProps {
  activeClient: string;
  onSelectClient: (clientId: string) => void;
}

export const ClientAssistantPanel: React.FC<ClientAssistantPanelProps> = ({
  activeClient,
  onSelectClient
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const { categoryMessages, handleSendMessage, isProcessing } = useConversations('client');

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
  const clientMessages = (categoryMessages.client || []).map(msg => ({
    id: msg.id,
    content: msg.content,
    role: msg.role,
    timestamp: msg.timestamp,
    module: 'client'
  }));

  if (!activeClient) {
    return <ClientOverview />;
  }

  return (
    <div className="h-full">
      <ConversationView
        messages={clientMessages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSend}
        handleKeyPress={handleKeyPress}
        isProcessing={isProcessing}
      />
    </div>
  );
};

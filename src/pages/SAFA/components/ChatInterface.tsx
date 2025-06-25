
import React, { useState } from 'react';
import { useConversations } from '../hooks/useConversations';
import { ConversationView } from './ConversationView';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  category: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ category }) => {
  const [inputMessage, setInputMessage] = useState("");
  const { categoryMessages, handleSendMessage, isProcessing } = useConversations(category);

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

  // Get messages for the current category
  const messages = categoryMessages[category] || [];

  return (
    <div className="h-full">
      <ConversationView
        messages={messages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSend}
        handleKeyPress={handleKeyPress}
        isProcessing={isProcessing}
      />
    </div>
  );
};

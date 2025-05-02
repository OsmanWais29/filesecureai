
import { useState, useEffect } from "react";

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export function useChatMessages() {
  const [message, setMessage] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [completionPercentage, setCompletionPercentage] = useState<number>(65);

  const toggleRecording = () => {
    setIsRecording(prev => !prev);
    
    // Simulate speech-to-text when recording is stopped
    if (isRecording) {
      setMessage("I need help with this client's proposal.");
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const newUserMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: message
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setMessage(""); // Clear input
    
    // Simulate assistant response after delay
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: Date.now(),
        role: 'assistant',
        content: "I've analyzed this client's proposal. There appear to be some discrepancies in the income verification that need attention. Would you like me to highlight the specific areas of concern?"
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Update completion percentage
      setCompletionPercentage(prev => Math.min(prev + 5, 100));
    }, 1000);
  };

  return {
    message,
    setMessage,
    chatMessages,
    isRecording,
    completionPercentage,
    toggleRecording,
    handleSendMessage
  };
}

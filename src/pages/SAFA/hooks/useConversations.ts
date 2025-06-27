
import { useState, useCallback } from 'react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
}

type TabType = 'document' | 'legal' | 'help' | 'client';

export const useConversations = (activeTab: TabType) => {
  const [categoryMessages, setCategoryMessages] = useState<Record<TabType, Message[]>>({
    document: [],
    legal: [],
    help: [],
    client: []
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      type: 'user',
      timestamp: new Date(),
      category: activeTab
    };

    // Add user message
    setCategoryMessages(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], userMessage]
    }));

    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: `This is a response for the ${activeTab} category. I understand you said: "${content}"`,
        type: 'assistant',
        timestamp: new Date(),
        category: activeTab
      };

      setCategoryMessages(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], aiMessage]
      }));

      setIsProcessing(false);
    }, 1000);
  }, [activeTab]);

  const loadConversationHistory = useCallback((category: TabType) => {
    // This would typically load from a database or API
    console.log(`Loading conversation history for ${category}`);
  }, []);

  return {
    categoryMessages,
    handleSendMessage,
    isProcessing,
    loadConversationHistory
  };
};

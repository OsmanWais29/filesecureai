
import { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/hooks/use-toast';

// Define initial messages for each module
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

export const useConversations = (initialActiveModule: string) => {
  const [categoryMessages, setCategoryMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { user } = useAuthState();
  const { toast } = useToast();

  // Load conversations from localStorage or database on component mount
  useEffect(() => {
    const loadSavedMessages = () => {
      const savedMessages: Record<string, ChatMessage[]> = {...INITIAL_MESSAGES};
      
      Object.keys(INITIAL_MESSAGES).forEach(module => {
        const key = `${module}_messages`;
        const saved = localStorage.getItem(key);
        if (saved) {
          savedMessages[module] = JSON.parse(saved);
        }
      });
      
      setCategoryMessages(savedMessages);
    };
    
    loadSavedMessages();
  }, []);

  // Function to handle sending a message
  const handleSendMessage = async (content: string, moduleOverride?: string) => {
    if (!content.trim() || isProcessing) return;
    
    const module = moduleOverride || initialActiveModule;
    setIsProcessing(true);
    
    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      content: content,
      type: 'user',
      timestamp: new Date(),
      module: module
    };
    
    // Update messages with user input
    const updatedMessages = {
      ...categoryMessages,
      [module]: [...categoryMessages[module], newUserMessage]
    };
    
    setCategoryMessages(updatedMessages);
    
    try {
      // In a real app, you would call an AI service here
      // This is a placeholder for the actual API call
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          content: `I understand your query about "${content}". As this is a demo version, I can provide basic assistance. In the full version, I would give a detailed response based on the ${module} module.`,
          type: 'assistant',
          timestamp: new Date(),
          module: module
        };
        
        const finalMessages = {
          ...updatedMessages,
          [module]: [...updatedMessages[module], assistantMessage]
        };
        
        setCategoryMessages(finalMessages);
        
        // Save to localStorage
        localStorage.setItem(`${module}_messages`, JSON.stringify(finalMessages[module]));
        
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

  return {
    categoryMessages,
    handleSendMessage,
    isProcessing,
  };
};

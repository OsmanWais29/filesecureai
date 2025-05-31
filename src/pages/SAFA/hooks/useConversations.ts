
import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { supabase } from '@/lib/supabase';
import { safeStringCast } from '@/utils/typeGuards';

interface UseConversationsResult {
  categoryMessages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, category: string) => Promise<void>;
  loadConversation: (category: string) => Promise<void>;
  clearConversation: (category: string) => void;
  handleSendMessage: (content: string) => Promise<void>;
  isProcessing: boolean;
  loadConversationHistory: (category: string) => Promise<void>;
}

export const useConversations = (activeTab?: string): UseConversationsResult => {
  const [categoryMessages, setCategoryMessages] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async (category: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('messages')
        .eq('type', category)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const messages = data?.messages || [];
      const safeMessages = Array.isArray(messages) ? messages.map((msg: any) => ({
        id: safeStringCast(msg.id),
        content: safeStringCast(msg.content),
        role: (msg.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        timestamp: safeStringCast(msg.timestamp),
        category: safeStringCast(msg.category || category)
      } as ChatMessage)) : [];

      setCategoryMessages(prev => ({
        ...prev,
        [category]: safeMessages
      }));
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
      setCategoryMessages(prev => ({
        ...prev,
        [category]: []
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, category: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        content,
        role: 'user',
        timestamp: new Date().toISOString(),
        category
      };

      setCategoryMessages(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), userMessage]
      }));

      // Save to database
      const updatedMessages = [...(categoryMessages[category] || []), userMessage];
      
      await supabase
        .from('conversations')
        .upsert({
          type: category,
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        });

      // Simulate AI response after a delay
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          content: generateAIResponse(content),
          role: 'assistant',
          timestamp: new Date().toISOString(),
          category
        };

        setCategoryMessages(prev => ({
          ...prev,
          [category]: [...(prev[category] || []), aiMessage]
        }));

        setIsProcessing(false);
      }, 1500);

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setIsProcessing(false);
    }
  }, [categoryMessages]);

  const generateAIResponse = (userMessage: string): string => {
    if (userMessage.toLowerCase().includes("upload") || userMessage.toLowerCase().includes("document")) {
      return "To upload documents in SecureFiles AI, navigate to the Documents page and use the drag-and-drop upload area or click the Upload button. The system supports PDF, Excel, Word, and image files. You can also use the 'Train AI' button here to upload documents specifically for improving my responses.";
    }
    if (userMessage.toLowerCase().includes("bankruptcy") || userMessage.toLowerCase().includes("form")) {
      return "SecureFiles AI supports all bankruptcy forms (Forms 1-96). Each form has specific validation rules and risk assessments. Forms like 47 (Consumer Proposal) and 65 (Assignment) have automated compliance checking. I can help you understand the requirements for any specific form.";
    }
    if (userMessage.toLowerCase().includes("risk")) {
      return "Our AI-powered risk assessment analyzes documents for compliance issues, missing signatures, incomplete fields, and regulatory violations. Risk levels are color-coded: Green (low), Orange (medium), and Red (high priority). Would you like me to explain how to interpret risk assessments?";
    }
    if (userMessage.toLowerCase().includes("user") || userMessage.toLowerCase().includes("permission")) {
      return "User management is handled through the Settings > Access Control section. You can assign roles, manage province-based access, and configure IP whitelisting for enhanced security. Each user role has different permissions for document access and system features.";
    }
    if (userMessage.toLowerCase().includes("train") || userMessage.toLowerCase().includes("training")) {
      return "You can train me by uploading documents using the 'Train AI' button. I'll analyze these documents to improve my responses and knowledge base. Supported formats include PDF, Word, Excel, and text files. The more relevant documents you upload, the better I can assist you.";
    }
    return "I'm here to help you with SecureFiles AI. I can assist with document upload procedures, bankruptcy form guidance, risk assessment features, user management, AI training, and platform navigation. What specific area would you like help with?";
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (activeTab) {
      await sendMessage(content, activeTab);
    }
  }, [activeTab, sendMessage]);

  const loadConversationHistory = useCallback(async (category: string) => {
    await loadConversation(category);
  }, [loadConversation]);

  const clearConversation = useCallback((category: string) => {
    setCategoryMessages(prev => ({
      ...prev,
      [category]: []
    }));
  }, []);

  return {
    categoryMessages,
    isLoading,
    error,
    sendMessage,
    loadConversation,
    clearConversation,
    handleSendMessage,
    isProcessing,
    loadConversationHistory
  };
};


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

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  }, [categoryMessages]);

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

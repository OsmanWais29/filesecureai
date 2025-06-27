
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  category: string;
}

export interface ConversationState {
  messages: ChatMessage[];
  isLoading: boolean;
  error?: string;
}

export type TabType = 'document' | 'legal' | 'help' | 'client';


export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  category?: string;
}

export interface MessageProps {
  message: ChatMessage;
}


export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  module: string;
}

export interface MessageProps {
  message: ChatMessage;
}

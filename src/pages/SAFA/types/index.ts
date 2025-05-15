
export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  module: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  last_interaction?: string;
}


export type TabType = 'document' | 'legal' | 'help' | 'client';

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
}

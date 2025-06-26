
export interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  storage_path?: string;
  size?: number;
  metadata?: Record<string, any>;
  parent_folder_id?: string;
  user_id?: string;
  is_folder?: boolean;
  folder_type?: string;
  deadlines?: any[];
  status?: string;
  ai_processing_status?: string;
  tasks?: Task[];
  description?: string;
  url?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  client_id?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  location?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  company?: string;
  occupation?: string;
  mobilePhone?: string;
  notes?: string;
  last_interaction?: string;
  engagement_score: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  metrics?: {
    openTasks: number;
    pendingDocuments: number;
    urgentDeadlines: number;
  };
}

export interface FileInfo {
  name: string;
  file: File;
  documentId?: string;
  status?: 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface MeetingData {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration?: number;
  client_id?: string;
  client_name?: string;
  attendees?: any[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_type?: string;
  location?: string;
  meeting_url?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  category?: string;
}

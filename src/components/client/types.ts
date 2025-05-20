
export interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  storage_path: string;
  parent_folder_id?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  is_folder?: boolean;
  folder_type?: string;
  size?: number;
  deadlines?: any[];
  status?: string;
  ai_processing_status?: string;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  file: File;
  status: string;
  progress: number;
  documentId: string;
  error?: string;
}

export interface ClientMetrics {
  openTasks: number;
  pendingDocuments: number;
  urgentDeadlines: number;
  [key: string]: number;
}

export interface Client {
  id: string;
  name: string;
  status: string;
  location?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  company?: string;
  occupation?: string;
  mobilePhone?: string;
  notes?: string;
  metrics?: ClientMetrics;
  last_interaction?: string;
  engagement_score?: number;
  [key: string]: any;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
  description?: string;
  client_id?: string;
  document_id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  document_id: string;
}

export interface ClientInfoPanelProps {
  client: Client;
  tasks: Task[];
  documentCount: number;
  lastActivityDate: string;
  documents: Document[];
  onDocumentSelect: (documentId: string) => void;
  selectedDocumentId: string | null;
  onClientUpdate: (client: Client) => void;
}

export interface ClientViewerProps {
  clientId: string;
  onBack?: () => void;
}

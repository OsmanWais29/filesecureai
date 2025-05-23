
export interface ClientViewerProps {
  clientId: string;
  onBack?: () => void;
  onDocumentOpen?: (documentId: string) => void;
  onError?: () => void;
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
  email?: string;
  phone?: string;
  mobilePhone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_activity?: string;
  last_interaction?: string;
  engagement_score?: number;
  metadata?: Record<string, unknown>;
  location?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  company?: string;
  occupation?: string;
  notes?: string;
  metrics?: ClientMetrics;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  storage_path?: string;
  parent_folder_id?: string;
  user_id?: string;
  metadata?: Record<string, unknown>;
  is_folder?: boolean;
  folder_type?: string;
  size?: number;
  deadlines?: any[];
  status?: string;
  ai_processing_status?: string;
  tasks?: Task[];
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  dueDate?: string; // Keep both for compatibility
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  assignedTo?: string; // Keep both for compatibility
  created_by: string;
  client_id?: string;
  document_id?: string;
}

export interface ClientInfoPanelProps {
  client: Client;
  tasks: Task[];
  documentCount: number;
  lastActivityDate: string;
  documents: Document[];
  onClientUpdate: (updatedClient: Client) => void;
  onDocumentSelect: (documentId: string) => void;
  selectedDocumentId: string;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  file: File;
  status: string;
  progress: number;
  documentId?: string;
  error?: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  document_id: string;
}

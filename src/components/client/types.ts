
export interface ClientViewerProps {
  clientId: string;
  onBack?: () => void;
  onDocumentOpen?: (documentId: string) => void;
  onError?: () => void;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_activity?: string;
  engagement_score?: number;
  metadata?: Record<string, unknown>;
}

export interface Document {
  id: string;
  title: string;
  type: string;
  created_at: string;
  updated_at: string;
  storage_path?: string;
  metadata?: Record<string, unknown>;
  status?: string;
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
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  created_by: string;
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

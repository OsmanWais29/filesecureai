
// Base document record type
export interface DocumentRecord {
  id: string;
  title: string;
  storage_path: string;
  type: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

// Document details type with additional information
export interface DocumentDetails extends DocumentRecord {
  versions: DocumentVersion[];
  tasks: Task[];
  comments: Comment[];
  analysis?: Array<{
    id: string;
    content: Record<string, unknown>;
  }>;
}

// Document version type
export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  created_at: string;
  description?: string;
  is_current: boolean;
  changes_summary?: string;
  storage_path: string;
  versionNumber?: number; // For backwards compatibility
  createdAt?: string; // For backwards compatibility
}

// Task type
export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  assigned_to?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  severity?: string;
  document_id?: string;
  solution?: string;
}

// Comment type
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  document_id: string;
}

// Risk type
export interface Risk {
  id?: string;
  type: string;
  description: string;
  severity: string;
  impact?: string;
  regulation?: string;
  solution?: string;
}

// Deadline type
export interface Deadline {
  id?: string;
  title: string;
  dueDate: string;
  description?: string;
  status?: string;
}

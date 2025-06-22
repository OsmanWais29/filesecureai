
// Base document record type
export interface DocumentRecord {
  id: string;
  title: string;
  storage_path: string;
  type?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

// Document details type with additional information
export interface DocumentDetails {
  id: string;
  title: string;
  type: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
  analysis?: DocumentAnalysis[];
  comments?: Comment[];
  tasks?: Task[];
  versions?: DocumentVersion[];
  deadlines?: Deadline[];
  // Add other fields that might be available
  metadata?: Record<string, unknown>;
  parent_folder_id?: string;
  ai_processing_status?: string;
  ai_processing_stage?: string;
}

// Document version type
export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  storage_path?: string;
  created_at: string;
  created_by?: string;
  description?: string;
  is_current?: boolean;
  changes_summary?: string;
}

// Task type
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  severity: string;
  document_id?: string;
  regulation?: string;
  solution?: string;
}

// Comment type
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  document_id: string;
  parent_id?: string;
}

// Risk type - Updated to include the missing properties
export interface Risk {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  regulation?: string;
  impact?: string;
  requiredAction?: string;
  solution?: string;
  deadline?: string;
  biaCitation?: string;
  suggestedFix?: string;
  resolved?: boolean;
}

// Deadline type
export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  description?: string;
  priority: string;
  status: string;
}

// Document analysis type
export interface DocumentAnalysis {
  id: string;
  content: {
    extracted_info?: Record<string, unknown>;
    risks?: Risk[];
    regulatory_compliance?: {
      status: string;
      details: string;
      references: string[];
    };
  };
}

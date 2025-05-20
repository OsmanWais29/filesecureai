
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

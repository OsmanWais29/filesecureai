
export interface Document {
  id: string;
  title: string;
  created_at: string;
  size?: number;
  type?: string;
  storage_path?: string;
  metadata?: {
    client_name?: string;
    processing_complete?: boolean;
    processing_steps_completed?: string[];
    processing_stage?: string;
    processing_error?: string;
    excel_data?: any;
    extracted_info?: any;
    [key: string]: any;
  };
  parent_folder_id?: string;
  updated_at?: string;
  is_folder?: boolean;
  folder_type?: string;
  url?: string;
  ai_processing_status?: string;
  ai_confidence_score?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
}

export interface DocumentNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: DocumentNode[];
  metadata?: any;
  parent_id?: string;
  is_folder?: boolean;
  folder_type?: string;
}

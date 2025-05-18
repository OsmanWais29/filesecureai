export interface DocumentRecord {
  id: string;
  title: string;
  metadata: {
    client_name?: string;
    processing_complete?: boolean;
    processing_steps_completed?: string[];
    processing_stage?: string;
    processing_error?: string;
    excel_data?: any;
    extracted_info?: any;
    [key: string]: any;
  };
  ai_processing_status?: string;
  storage_path?: string;
  updated_at?: string;
}

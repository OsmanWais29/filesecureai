
export interface DocumentDetails {
  id: string;
  title: string;
  type?: string;
  created_at: string;
  updated_at: string;
  storage_path: string;
  analysis?: AnalysisResult[];
  comments?: Comment[];
}

export interface AnalysisResult {
  id: string;
  content: {
    extracted_info?: {
      formNumber?: string;
      formType?: string;
      summary?: string;
      [key: string]: any;
    };
    risks?: Risk[];
    [key: string]: any;
  };
}

export interface Risk {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  [key: string]: any;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  document_id: string;
  is_resolved?: boolean;
  parent_id?: string;
  mentions?: string[];
}

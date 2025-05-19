export interface DocumentDetails {
  id: string;
  title: string;
  type?: string;
  created_at: string;
  updated_at: string;
  storage_path: string;
  analysis?: AnalysisResult[];
  comments?: Comment[];
  tasks?: Task[];
  deadlines?: Deadline[];
  versions?: Version[];
  metadata?: Record<string, any>;
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

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  assigned_to?: string;
  created_by?: string;
  due_date?: string;
  severity?: string;
  document_id?: string;
  created_at?: string;
  updated_at?: string;
  regulation?: string;
  solution?: string;
}

export interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  description?: string;
}

export interface Version {
  id: string;
  version_number: number;
  storage_path: string;
  created_at?: string;
  created_by?: string;
  description?: string;
  is_current?: boolean;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  content: any;
  createdAt: string;
  createdBy?: string;
  isCurrent: boolean;
  description?: string;
  changesSummary?: string;
  metadata?: Record<string, any>;
  changes?: Record<string, any>[];
}

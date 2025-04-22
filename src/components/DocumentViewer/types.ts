

export interface Risk {
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  regulation?: string; 
  impact?: string;
  requiredAction?: string;
  solution?: string;
  deadline?: string;
}

export interface Deadline {
  id?: string;
  title: string;
  dueDate: string; // This is the field name we should use consistently
  description?: string;
  status?: 'pending' | 'completed' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
  due_date?: string; // Adding this for backward compatibility
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  created_by: string;
  status: string;
  due_date?: string;
  document_id?: string;
  severity: string;
  regulation?: string;
  solution?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentDetails {
  id: string;
  title: string;
  storage_path?: string;
  type?: string;
  size?: number; 
  created_at: string;
  updated_at: string;
  user_id?: string;
  metadata?: Record<string, any>;
  ai_confidence_score?: number;
  ai_processing_status?: string;
  parent_folder_id?: string;
  is_folder?: boolean;
  url?: string;
  folder_type?: string;
  deadlines?: Deadline[];
  tasks?: Task[];
  versions?: any[];
  analysis?: {
    id: string;
    content: {
      extracted_info?: {
        clientName?: string;
        name?: string;
        type?: string;
        formNumber?: string;
        administratorName?: string;
        filingDate?: string;
        submissionDeadline?: string;
        documentStatus?: string;
        summary?: string;
        [key: string]: any;
      };
      summary?: string;
      risks?: Risk[];
      debug_info?: Record<string, any>;
    };
  }[];
  comments?: {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
  }[];
}

export interface PreviewState {
  fileUrl: string | null;
  fileExists: boolean;
  isExcelFile: boolean;
  previewError: string | null;
  setPreviewError: (error: string | null) => void;
  analyzing: boolean;
  error: string | null;
  analysisStep: string;
  progress: number;
  processingStage: string;
  session: any;
  setSession: (session: any) => void;
  handleAnalyzeDocument: () => void;
  checkFile: (path?: string) => Promise<void>;
  isLoading: boolean;
  handleAnalysisRetry: () => void;
  isAnalysisStuck?: {
    stuck: boolean;
    minutesStuck: number;
  };
  networkStatus: 'online' | 'offline' | 'limited';
  attemptCount: number;
  fileType: string | null;
  handleFullRecovery?: () => Promise<void>;
  forceRefresh?: () => Promise<void>;
  errorDetails?: any;
  hasFallbackToDirectUrl?: boolean;
}

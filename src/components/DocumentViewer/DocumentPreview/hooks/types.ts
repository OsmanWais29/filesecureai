
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

export interface UseFileCheckerReturn {
  fileExists: boolean;
  checkFile: (storagePath: string) => Promise<boolean>;
  handleFileCheckError: (error: any, fileUrl?: string | null) => string;
}

export interface PreviewState {
  fileUrl: string | null;
  fileExists: boolean;
  isExcelFile: boolean;
  fileType: string | null;
  previewError: string | null;
  setPreviewError: (error: string | null) => void;
  analyzing: boolean;
  error: string | null;
  analysisStep: string | null;
  progress: number;
  processingStage: string | null;
  session: any;
  setSession: (session: any) => void;
  handleAnalyzeDocument: () => void;
  isAnalysisStuck: { stuck: boolean; minutesStuck: number };
  checkFile: (storagePath: string) => Promise<boolean>;
  isLoading: boolean;
  handleAnalysisRetry: () => void;
  hasFallbackToDirectUrl: boolean;
  networkStatus: string;
  attemptCount: number;
  fileType: string | null;
  handleFullRecovery: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  errorDetails: any;
  isPdfFile?: () => boolean;
  isDocFile?: () => boolean;
  isImageFile?: () => boolean;
  useDirectLink?: boolean;
  setUseDirectLink?: (value: boolean) => void;
  zoomLevel?: number;
  setZoomLevel?: (value: number) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onOpenInNewTab?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

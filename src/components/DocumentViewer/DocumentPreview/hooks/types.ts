
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
    deadlines?: any[];
    [key: string]: any;
  };
  ai_processing_status?: string;
  storage_path?: string;
  updated_at?: string;
}

export interface UseFileCheckerReturn {
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

export interface DocumentPreviewContentProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  previewState: PreviewState;
}

export interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export interface ViewerToolbarProps {
  title?: string;
  zoomLevel: number;
  isRetrying: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
  onOpenInNewTab: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export interface DocumentViewerFrameProps {
  fileUrl: string | null;
  title?: string;
  isLoading: boolean;
  useDirectLink: boolean;
  zoomLevel: number;
  isPdfFile: boolean;
  isDocFile: boolean;
  onIframeLoad: () => void;
  onIframeError: () => void;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  forceReload: number;
  onOpenInNewTab: () => void;
  onDownload: () => void;
}

export interface NetworkResilienceResult {
  isOnline: boolean;
  resetRetries: () => void;
  incrementRetry: () => void;
  shouldRetry: (error: Error | { message: string }) => boolean;
}

export interface FileLoadResult {
  success: boolean;
  url?: string;
  method?: string;
  error?: any;
}

export interface DocumentAIProps {
  documentId: string;
  storagePath: string;
}

export interface DocumentAIResult {
  documentRecord: DocumentRecord;
  isLoading: boolean;
  error: string;
  analyzing: boolean;
  progress: number;
  analysisStatus: string;
  analysisStep: string;
  retryCount: number;
  processingStage: string | null;
  processDocument: () => Promise<boolean>;
  handleAnalysisRetry: () => Promise<void>;
  checkDocumentStatus: () => Promise<DocumentRecord | null>;
  fetchDocumentDetails: () => Promise<DocumentRecord | null>;
  checkProcessingError: () => Promise<string | null>;
  getProcessingSteps: () => Promise<string[]>;
  updateProcessingStep: (step: string) => Promise<void>;
}

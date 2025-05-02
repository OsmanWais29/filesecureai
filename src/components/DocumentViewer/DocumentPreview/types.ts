
// File: src/components/DocumentViewer/DocumentPreview/types.ts

// Basic preview state properties
export interface PreviewState {
  fileUrl: string | null;
  fileExists: boolean;
  isExcelFile: boolean;
  previewError: string | null;
  setPreviewError: (error: string | null) => void;
  analyzing: boolean;
  error: string | null;
  analysisStep: string | null;
  progress: number;
  processingStage?: string | null;
  session: any;
  setSession: (session: any) => void;
  handleAnalyzeDocument: () => Promise<void>;
  isAnalysisStuck?: {
    stuck: boolean;
    minutesStuck: number;
  };
  checkFile: () => Promise<void>;
  isLoading: boolean;
  handleAnalysisRetry: () => void;
  hasFallbackToDirectUrl: boolean;
  networkStatus: string;
  attemptCount: number;
  fileType: string | null;
  handleFullRecovery: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  errorDetails: any;
}

// Props for DocumentPreviewContent
export interface DocumentPreviewContentProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  previewState: PreviewState;
}

// Props for ErrorDisplay component
export interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

// Props for ViewerToolbar component
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

// Props for DocumentViewerFrame component
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

// Network resilience interface
export interface NetworkResilienceResult {
  isOnline: boolean;
  resetRetries: () => void;
  incrementRetry: () => void;
  shouldRetry: (error: Error | { message: string }) => boolean;
}

// File load result interface
export interface FileLoadResult {
  success: boolean;
  url?: string;
  method?: string;
  error?: any;
}

// File checker return interface
export interface UseFileCheckerReturn {
  checkFile: (path: string) => Promise<void>;
  handleFileCheckError: (error: any, publicUrl?: string | null) => void;
}

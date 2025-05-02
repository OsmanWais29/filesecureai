
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

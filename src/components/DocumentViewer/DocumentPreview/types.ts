
import { RefObject } from "react";

export interface DocumentPreviewProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  showControls?: boolean;
  bypassAnalysis?: boolean;
  onAnalysisComplete?: () => void;
}

export interface PreviewState {
  fileExists: boolean;
  fileUrl: string | null;
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
  handleAnalyzeDocument: (session: any) => void;
  isAnalysisStuck: {
    stuck: boolean;
    minutesStuck: number;
  };
  checkFile: (path?: string) => Promise<void>;
  isLoading: boolean;
  handleAnalysisRetry: () => void;
  hasFallbackToDirectUrl: boolean;
  networkStatus: 'online' | 'offline' | 'limited';
  attemptCount: number;
  fileType?: string | null;
  handleFullRecovery?: () => Promise<void>;
  forceRefresh?: () => Promise<void>;
  errorDetails?: any;
}

export interface DocumentPreviewContentProps {
  storagePath: string;
  documentId: string;
  title: string;
  previewState: PreviewState;
}

export interface DocumentViewerFrameProps {
  fileUrl: string;
  title: string;
  isLoading: boolean;
  useDirectLink: boolean;
  zoomLevel: number;
  isPdfFile: boolean;
  isDocFile: boolean;
  onIframeLoad: () => void;
  onIframeError: () => void;
  iframeRef: RefObject<HTMLIFrameElement>;
  forceReload: number;
  onOpenInNewTab?: () => void;
  onDownload?: () => void;
}

export interface ViewerToolbarProps {
  title: string;
  zoomLevel: number;
  isRetrying: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRefresh: () => void;
  onOpenInNewTab: () => void;
  onDownload: () => void;
  onPrint: () => void;
}

export interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export interface PDFViewerProps {
  fileUrl: string | null;
  title: string;
  zoomLevel: number;
  onLoad?: () => void;
  onError?: () => void;
}

export interface NetworkStatusIndicatorProps {
  isOnline: boolean;
  onRetry: () => void;
  attemptCount?: number;
}

export interface UseNetworkMonitorReturn {
  networkStatus: 'online' | 'offline' | 'limited';
  handleOnline: () => void;
  handleOffline: () => void;
}

export interface UseFileCheckerReturn {
  checkFile: (storagePath: string) => Promise<void>;
  handleFileCheckError: (error: any, publicUrl?: string | null) => void;
}

export interface UseRetryStrategyReturn {
  attemptCount: number;
  incrementAttempt: () => void;
  resetAttempts: () => void;
  lastAttempt: Date | null;
  setLastAttempt: (date: Date) => void;
  shouldRetry: (currentAttempt: number) => boolean;
  getRetryDelay: (attempt: number) => number;
}

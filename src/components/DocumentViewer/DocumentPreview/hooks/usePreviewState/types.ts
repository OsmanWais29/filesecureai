
import { Session } from "@supabase/supabase-js";
import { RefObject } from "react";

export interface PreviewStateProps {
  documentId: string;
  storagePath: string;
  title?: string;
  onAnalysisComplete?: () => void;
  bypassAnalysis?: boolean;
}

export interface PreviewState {
  // Basic file properties
  fileUrl: string | null;
  fileExists: boolean;
  fileType: string | null;
  isExcelFile: boolean;
  
  // Error handling
  previewError: string | null;
  setPreviewError: (error: string | null) => void;
  error: string | null;
  
  // Analysis state
  analyzing: boolean;
  analysisStep: string;
  progress: number;
  processingStage: string;
  
  // Loading state
  isLoading: boolean;
  
  // Analysis control
  handleAnalyzeDocument: (session?: Session | null) => Promise<void>;
  isAnalysisStuck: { stuck: boolean; minutesStuck: number };
  handleAnalysisRetry: () => void;
  
  // UI helpers
  checkFile: () => Promise<void>;
  handleFullRecovery: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  
  // Network resilience
  hasFallbackToDirectUrl: boolean;
  networkStatus: string;
  attemptCount: number;
  
  // Error details
  errorDetails: any;
  
  // Public URL for download/sharing
  publicUrl?: string;
  
  // Document type checks
  isPdfFile: () => boolean;
  isDocFile: () => boolean;
  isImageFile: () => boolean;
  
  // Viewing options
  useDirectLink: boolean;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenInNewTab: () => void;
  onDownload: () => void;
  onPrint: () => void;
  
  // References
  iframeRef: RefObject<HTMLIFrameElement>;
  forceReload: number;
  
  // Session management
  session: Session | null;
  setSession: (session: Session | null) => void;
}

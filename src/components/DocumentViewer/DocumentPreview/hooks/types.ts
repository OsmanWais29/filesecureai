
import { Session } from "@supabase/supabase-js";
import { RefObject } from "react";

export interface DocumentRecord {
  id: string;
  title: string;
  storage_path: string;
  metadata: any;
  ai_processing_status: string;
  [key: string]: any;
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
  session: Session | null;
  setSession: (session: Session | null) => void;
  handleAnalyzeDocument: () => Promise<void>;
  isAnalysisStuck: { stuck: boolean; minutesStuck: number; };
  checkFile: () => Promise<void>;
  isLoading: boolean;
  handleAnalysisRetry: () => void;
  hasFallbackToDirectUrl: boolean;
  networkStatus: string;
  attemptCount: number;
  fileType: string | null;
  handleFullRecovery: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  forceReload: number;
  errorDetails: any;
  isPdfFile: () => boolean;
  isDocFile: () => boolean;
  isImageFile: () => boolean;
  useDirectLink: boolean;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenInNewTab: () => void;
  onDownload: () => void;
  onPrint: () => void;
  iframeRef: RefObject<HTMLIFrameElement>;
  publicUrl: string;
}

export interface NetworkResilienceOptions {
  maxRetries?: number;
  backoffFactor?: number;
  initialDelay?: number;
}

export interface NetworkResilienceResult {
  isOnline: boolean;
  resetRetries: () => void;
  incrementRetry: () => void;
  shouldRetry: (error: any) => boolean;
}

export interface TimeTrackerResult {
  isAnalysisStuck: { stuck: boolean; minutesStuck: number };
  startTracking: () => void;
  stopTracking: () => void;
}

export interface DocumentPreviewContentProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  previewState: PreviewState;
}


import { Session } from "@supabase/supabase-js";

export interface DocumentRecord {
  id: string;
  title: string;
  metadata: Record<string, unknown>;
  ai_processing_status?: string;
  storage_path?: string;
  updated_at?: string;
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
  handleAnalyzeDocument: () => Promise<boolean>;
  handleAnalysisRetry: () => Promise<void>;
  checkDocumentStatus: () => Promise<DocumentRecord | null>;
  fetchDocumentDetails: () => Promise<DocumentRecord | null>;
  checkProcessingError: () => Promise<string | null>;
  getProcessingSteps: () => Promise<string[]>;
  updateProcessingStep: (step: string) => Promise<void>;
}

export interface NetworkResilienceOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryBackoffFactor?: number;
}

export interface NetworkResilienceResult {
  isOnline: boolean;
  resetRetries: () => void;
  incrementRetry: () => void;
  shouldRetry: (error: Error | { message: string }) => boolean;
}

export interface TimeTrackerResult {
  isStuck: boolean;
  minutesStuck: number;
  startTracking: () => void;
  stopTracking: () => void;
}

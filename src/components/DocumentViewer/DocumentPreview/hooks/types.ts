
export interface DocumentPreviewContentProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  previewState: any; // This will be expanded with the proper type later
}

export interface TimeTrackerResult {
  isAnalysisStuck: { stuck: boolean; minutesStuck: number };
  startTracking: () => void;
  stopTracking: () => void;
}

export interface DocumentRecord {
  id: string;
  title?: string;
  type?: string;
  storage_path?: string;
  ai_processing_status?: string;
  metadata?: Record<string, unknown>;
  updated_at?: string;
  created_at?: string;
}

export interface AnalysisResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface NetworkResilienceOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryMultiplier?: number;
}

export interface NetworkResilienceResult {
  isOnline: boolean;
  resetRetries: () => void;
  incrementRetry: () => void;
  shouldRetry: (error: Error) => boolean;
  retryCount: number;
}

export interface FileLoadResult {
  success: boolean;
  url?: string;
  method?: string;
  error?: Error;
}

export interface UseFileCheckerReturn {
  checkFile: (path: string) => Promise<boolean>;
  handleFileCheckError: (error: Error, fileUrl?: string | null) => void;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  severity?: string;
  assigned_to?: string;
  document_id?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version_number: number;
  content: any;
  createdAt: string;
  is_current: boolean;
  changes: any[];
}

export interface VersionComparisonProps {
  currentVersion: DocumentVersion;
  previousVersion: DocumentVersion;
}

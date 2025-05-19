
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

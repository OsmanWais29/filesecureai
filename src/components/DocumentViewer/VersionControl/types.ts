
export interface DocumentVersion {
  id: string;
  documentId: string;
  content: Record<string, unknown>;
  createdAt: string;
  userId: string;
  versionNumber: number;
  description?: string;
  storagePath?: string;
  isCurrent?: boolean;
  changes?: {
    added?: number;
    removed?: number;
    modified?: number;
  };
}

export interface VersionComparisonProps {
  oldVersion: DocumentVersion;
  newVersion: DocumentVersion;
  onClose: () => void;
}

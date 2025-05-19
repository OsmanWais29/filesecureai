
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
}

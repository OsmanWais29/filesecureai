
export interface FolderStructure {
  id: string;
  name: string;
  type: 'form' | 'document' | 'client' | 'folder' | 'estate';
  parentId?: string;
  children: FolderStructure[];
  metadata?: Record<string, any>;
  level?: number;
  parent_id?: string;
  is_folder?: boolean;
  folder_type?: string;
}

export interface FolderOperationResult {
  success: boolean;
  message: string;
  folderId?: string;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'trustee' | 'client' | 'administrator';

export interface FolderPermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export interface FolderRecommendation {
  documentId: string;
  documentTitle: string;
  suggestedFolderId: string;
  folderPath: string[];
  confidence: number;
  reason: string;
}

export interface FolderAIRecommendation {
  documentId: string;
  documentTitle: string;
  suggestedPath: string[];
  reason: string;
  confidence: number;
}

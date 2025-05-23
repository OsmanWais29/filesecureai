

export interface FolderStructure {
  id: string;
  name: string;
  type: 'client' | 'estate' | 'form' | 'document' | 'folder';
  level: number;
  children?: FolderStructure[];
  metadata?: Record<string, any>;
  parent_id?: string;
  is_folder?: boolean;
  folder_type?: string;
}

export interface FolderPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canAddFiles: boolean;
}

export interface FolderNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FolderNode[];
  metadata?: any;
  parent_id?: string;
  is_folder?: boolean;
  folder_type?: string;
}

export type UserRole = 'admin' | 'trustee' | 'client' | 'creditor' | 'debtor' | 'administrator';

export interface FolderRecommendation {
  id: string;
  type: 'organize' | 'merge' | 'archive' | 'cleanup';
  title: string;
  description: string;
  confidence: number;
  action: () => void;
  documentId: string;
  suggestedFolderId: string;
  documentTitle: string;
  folderPath: string[];
  reason: string;
}

export interface FolderAIRecommendation {
  id: string;
  folderId: string;
  type: 'organization' | 'security' | 'compliance';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedAction: string;
  confidence: number;
  createdAt: string;
  suggestedPath: string[];
  reason: string;
}

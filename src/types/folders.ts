
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

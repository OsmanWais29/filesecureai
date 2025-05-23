
export interface FolderStructure {
  id: string;
  name: string;
  type: 'form' | 'document' | 'client' | 'folder' | 'estate';
  parentId?: string;
  children: FolderStructure[];
  metadata?: Record<string, any>;
}

export interface FolderOperationResult {
  success: boolean;
  message: string;
  folderId?: string;
}

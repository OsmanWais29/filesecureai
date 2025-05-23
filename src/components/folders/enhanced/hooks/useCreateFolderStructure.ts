
import { useMemo } from 'react';
import { FolderStructure } from '@/types/folders';
import { Document } from '@/types/client';

export function useCreateFolderStructure(documents: Document[]) {
  const folders = useMemo(() => {
    const folderMap = new Map<string, FolderStructure>();
    const rootFolders: FolderStructure[] = [];

    // Create folders from documents
    documents.forEach(doc => {
      if (doc.is_folder) {
        const folder: FolderStructure = {
          id: doc.id,
          name: doc.title,
          type: (doc.folder_type as FolderStructure['type']) || 'folder',
          children: [],
          metadata: doc.metadata,
          parentId: doc.parent_folder_id || undefined,
          is_folder: true,
          folder_type: doc.folder_type
        };
        folderMap.set(doc.id, folder);
      }
    });

    // Build hierarchy
    folderMap.forEach(folder => {
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(folder);
        } else {
          rootFolders.push(folder);
        }
      } else {
        rootFolders.push(folder);
      }
    });

    // Sort folders
    const sortFolders = (folders: FolderStructure[]): FolderStructure[] => {
      return folders.sort((a, b) => a.name.localeCompare(b.name)).map(folder => ({
        ...folder,
        children: folder.children ? sortFolders(folder.children) : []
      }));
    };

    return sortFolders(rootFolders);
  }, [documents]);

  return { folders };
}

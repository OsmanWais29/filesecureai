
import { useMemo } from 'react';
import { FolderStructure } from '@/types/folders';
import { Document } from '@/types/client';
import { isForm47or76 } from '../utils/documentUtils';

export function useFolderExpansion(
  folders: FolderStructure[],
  documents: Document[],
  expandedFolders: Record<string, boolean>,
  setExpandedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
) {
  // Get Form 47 documents for prioritization
  const form47Documents = useMemo(() => {
    return documents.filter(doc => isForm47or76(doc));
  }, [documents]);

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setExpandedFolders(prev => {
      const newState = { ...prev };
      
      if (newState[folderId]) {
        // Collapsing - also collapse all children
        const collapseChildren = (parentId: string) => {
          const folder = findFolderById(folders, parentId);
          if (folder?.children) {
            folder.children.forEach(child => {
              if (child.parent_id === parentId) {
                newState[child.id] = false;
                collapseChildren(child.id);
              }
            });
          }
        };
        
        newState[folderId] = false;
        collapseChildren(folderId);
      } else {
        // Expanding
        newState[folderId] = true;
      }
      
      return newState;
    });
  };

  // Helper function to find folder by ID
  const findFolderById = (folders: FolderStructure[], id: string): FolderStructure | null => {
    for (const folder of folders) {
      if (folder.id === id) {
        return folder;
      }
      if (folder.children) {
        const found = findFolderById(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  return {
    toggleFolder,
    form47Documents
  };
}

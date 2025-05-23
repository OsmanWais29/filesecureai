
import { FolderStructure } from "@/types/folders";
import { Document } from "@/components/DocumentList/types";
import { FolderItem } from "./FolderItem";

interface FolderListProps {
  folders: FolderStructure[];
  onFolderSelect: (folderId: string) => void;
  onDocumentSelect: (documentId: string) => void;
  onDocumentOpen: (documentId: string) => void;
  onRenameDocument: (document: any) => void;
  selectedFolderId?: string;
  expandedFolders: Record<string, boolean>;
  toggleFolder: (folderId: string, e: React.MouseEvent) => void;
  handleDragStart: (id: string, type: 'folder' | 'document') => void;
  handleDragOver: (e: React.DragEvent, folderId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetFolderId: string) => void;
  dragOverFolder: string | null;
  documents?: Document[];
}

export const FolderList = ({
  folders,
  onFolderSelect,
  onDocumentSelect,
  onDocumentOpen,
  onRenameDocument,
  documents = []
}: FolderListProps) => {
  return (
    <>
      {folders.map(folder => (
        <FolderItem
          key={folder.id}
          folder={folder}
          documents={documents}
          onFolderSelect={onFolderSelect}
          onDocumentSelect={onDocumentSelect}
          onDocumentOpen={onDocumentOpen}
          onRenameDocument={onRenameDocument}
        />
      ))}
    </>
  );
};

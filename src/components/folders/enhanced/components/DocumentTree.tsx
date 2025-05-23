
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderList } from "./FolderList";
import { EmptyFolderState } from "./EmptyFolderState";
import { EmptyClientState } from "./EmptyClientState";
import { FolderStructure } from "@/types/folders";
import { Document } from "@/components/DocumentList/types";

interface DocumentTreeProps {
  filteredFolders: FolderStructure[];
  filteredDocuments: Document[];
  form47Documents: Document[];
  selectedFolderId?: string;
  selectedClientId?: string;
  expandedFolders: Record<string, boolean>;
  dragOverFolder: string | null;
  onFolderSelect: (folderId: string) => void;
  onDocumentSelect: (documentId: string) => void;
  onDocumentOpen: (documentId: string) => void;
  onRenameDocument: (document: Document) => void;
  toggleFolder: (folderId: string, e: React.MouseEvent) => void;
  handleDragStart: (id: string, type: 'folder' | 'document') => void;
  handleDragOver: (e: React.DragEvent, folderId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetFolderId: string) => void;
}

export const DocumentTree = ({
  filteredFolders,
  filteredDocuments,
  form47Documents,
  selectedFolderId,
  selectedClientId,
  expandedFolders,
  dragOverFolder,
  onFolderSelect,
  onDocumentSelect,
  onDocumentOpen,
  onRenameDocument,
  toggleFolder,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop
}: DocumentTreeProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="pr-4 pl-2">
        {filteredFolders.length > 0 ? (
          <FolderList
            folders={filteredFolders}
            onFolderSelect={onFolderSelect}
            onDocumentSelect={onDocumentSelect}
            onDocumentOpen={onDocumentOpen}
            onRenameDocument={onRenameDocument}
            selectedFolderId={selectedFolderId}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            dragOverFolder={dragOverFolder}
          />
        ) : (
          selectedClientId ? (
            <EmptyClientState />
          ) : (
            <EmptyFolderState />
          )
        )}
      </div>
    </ScrollArea>
  );
};

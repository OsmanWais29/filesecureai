
import { Document } from "@/components/DocumentList/types";
import { FolderGrid } from "../FolderGrid";

interface FolderTabProps {
  folders: Document[];
  documents: Document[];
  isDragging: boolean;
  selectedFolder: string | null;
  onFolderSelect: (folderId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, folderId: string) => void;
  onOpenDocument?: (documentId: string) => void;
  mergeableClientFolders?: Record<string, string[]>;
  highlightMergeTargets?: boolean;
}

export const FolderTab = ({
  folders,
  documents,
  isDragging,
  selectedFolder,
  onFolderSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenDocument,
  mergeableClientFolders = {},
  highlightMergeTargets = false
}: FolderTabProps) => {
  return (
    <FolderGrid
      folders={folders}
      documents={documents}
      isDragging={isDragging}
      selectedFolder={selectedFolder}
      onFolderSelect={onFolderSelect}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onOpenDocument={onOpenDocument}
      mergeableClientFolders={mergeableClientFolders}
      highlightMergeTargets={highlightMergeTargets}
    />
  );
};

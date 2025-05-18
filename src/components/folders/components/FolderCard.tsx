
import { Document } from "@/components/DocumentList/types";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { FolderDocumentList } from "./FolderDocumentList";
import { useState, memo, useCallback } from "react";

interface FolderCardProps {
  folder: Document;
  isExpanded: boolean;
  isSelected: boolean;
  isDragging: boolean;
  isPartOfMergeGroup: boolean;
  documents: Document[];
  onFolderSelect: (folderId: string) => void;
  onFolderDoubleClick: (folderId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, folderId: string) => void;
  onOpenDocument?: (documentId: string) => void;
}

export const FolderCard = memo(({
  folder,
  isExpanded,
  isSelected,
  isDragging,
  isPartOfMergeGroup,
  documents,
  onFolderSelect,
  onFolderDoubleClick,
  onDragOver,
  onDragLeave,
  onDrop,
  onOpenDocument
}: FolderCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Memoize filtered documents to prevent unnecessary computation
  const folderDocuments = documents.filter(doc => !doc.is_folder && doc.parent_folder_id === folder.id);
  const hasDocuments = folderDocuments.length > 0;

  // Memoize handlers to prevent recreation on each render
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);
  const handleSelect = useCallback(() => onFolderSelect(folder.id), [folder.id, onFolderSelect]);
  const handleDoubleClick = useCallback(() => onFolderDoubleClick(folder.id), [folder.id, onFolderDoubleClick]);
  const handleDrop = useCallback((e: React.DragEvent) => onDrop(e, folder.id), [folder.id, onDrop]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onFolderSelect(folder.id);
    if (e.key === 'Space') onFolderDoubleClick(folder.id);
  }, [folder.id, onFolderSelect, onFolderDoubleClick]);

  // Memoize the chevron click handler to prevent propagation
  const handleChevronClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFolderDoubleClick(folder.id);
  }, [folder.id, onFolderDoubleClick]);

  return (
    <div
      className={cn(
        "flex flex-col p-4 rounded-lg glass-panel transition-all duration-200 cursor-pointer",
        "border border-transparent hover:border-primary/30 hover:shadow-md",
        isDragging && "border-2 border-dashed border-primary/50",
        isSelected && "card-highlight bg-primary/5",
        isHovered && "bg-accent/10",
        isPartOfMergeGroup && "border-2 border-amber-500 bg-amber-50/30 dark:bg-amber-900/10"
      )}
      onClick={handleSelect}
      onDoubleClick={handleDoubleClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 rounded-md bg-primary/10 mr-3 flex items-center justify-center">
            <Folder className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{folder.title}</h4>
            <p className="text-sm text-muted-foreground">
              {folder.folder_type || 'Folder'}
              {folder.metadata?.count && (
                <span className="ml-1">- {folder.metadata.count} items</span>
              )}
              {!folder.metadata?.count && hasDocuments && (
                <span className="ml-1">- {folderDocuments.length} items</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Expand/collapse indicator */}
        {hasDocuments && (
          <button 
            className="p-1 rounded-full hover:bg-primary/10"
            onClick={handleChevronClick}
            aria-label={isExpanded ? "Collapse folder" : "Expand folder"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>

      {/* Expanded view showing documents in the folder */}
      {isExpanded && (
        <FolderDocumentList 
          documents={documents}
          folderId={folder.id}
          onOpenDocument={onOpenDocument}
        />
      )}
    </div>
  );
});

FolderCard.displayName = "FolderCard";

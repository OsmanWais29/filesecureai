
import { Document } from "@/components/DocumentList/types";
import { cn } from "@/lib/utils";
import { File, FileText, Lock } from "lucide-react";
import { 
  ContextMenu, 
  ContextMenuTrigger 
} from "@/components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useCallback, memo } from "react";
import { StatusIndicator } from "./StatusIndicator";
import { DocumentActions } from "./DocumentActions";
import { DocumentContextMenu } from "./DocumentContextMenu";
import { isDocumentLocked, isForm47or76, documentNeedsAttention } from "../../utils/documentUtils";

interface DocumentItemProps {
  document: Document;
  indentation: JSX.Element[];
  onSelect: (documentId: string) => void;
  onOpen: (documentId: string) => void;
  handleDragStart: (id: string, type: 'folder' | 'document') => void;
}

export const DocumentItem = memo(({
  document,
  indentation,
  onSelect,
  onOpen,
  handleDragStart
}: DocumentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(document.title);
  const needsAttention = documentNeedsAttention(document);

  // Memoize handlers to prevent recreations on each render
  const handleRename = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // In a real app, you would call an API to update the document title
      console.log(`Renamed document ${document.id} to ${newName}`);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [document.id, newName]);

  const handleDoubleClick = useCallback(() => {
    if (isDocumentLocked(document)) return;
    setIsEditing(true);
    setNewName(document.title);
  }, [document, document.title]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleClick = useCallback(() => {
    onSelect(document.id);
  }, [document.id, onSelect]);

  const handleStartDrag = useCallback(() => {
    handleDragStart(document.id, 'document');
  }, [document.id, handleDragStart]);

  // Memoize element rendering based on document state
  const documentIcon = isForm47or76(document) ? (
    <FileText className="h-4 w-4 text-primary mr-2" />
  ) : (
    <File className="h-4 w-4 text-muted-foreground mr-2" />
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-accent/50 rounded-sm cursor-pointer",
            "group transition-colors duration-200",
            needsAttention ? "bg-orange-50" : ""
          )}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          draggable
          onDragStart={handleStartDrag}
        >
          {indentation}
          {documentIcon}
          
          {isEditing ? (
            <input
              type="text"
              value={newName}
              onChange={handleChange}
              onKeyDown={handleRename}
              onBlur={handleBlur}
              autoFocus
              className="text-sm px-1 py-0.5 border border-primary rounded flex-1 outline-none"
            />
          ) : (
            <div className="flex items-center flex-1 space-x-2">
              <span className="text-sm truncate">{document.title}</span>
              <StatusIndicator document={document} />
              {isDocumentLocked(document) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This document is locked</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {document.metadata?.version && (
                <span className="text-xs text-muted-foreground">v{document.metadata.version}</span>
              )}
            </div>
          )}

          <DocumentActions 
            document={document} 
            onOpen={onOpen}
            onRename={handleDoubleClick}
          />
        </div>
      </ContextMenuTrigger>
      <DocumentContextMenu 
        document={document} 
        onOpen={onOpen}
        onRename={handleDoubleClick}
      />
    </ContextMenu>
  );
});

DocumentItem.displayName = "DocumentItem";

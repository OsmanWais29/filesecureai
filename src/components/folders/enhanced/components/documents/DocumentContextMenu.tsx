
import { Document } from "@/types/client";
import { 
  ContextMenuContent, 
  ContextMenuItem, 
  ContextMenuSeparator 
} from "@/components/ui/context-menu";
import { Edit2, Eye, Lock, MessageCircle, History } from "lucide-react";
import { isDocumentLocked } from "../../utils/documentUtils";

interface DocumentContextMenuProps {
  document: Document;
  onOpen: (documentId: string) => void;
  onRename: (document: Document) => void;
}

export const DocumentContextMenu = ({ document, onOpen, onRename }: DocumentContextMenuProps) => {
  return (
    <ContextMenuContent className="min-w-[160px]">
      <ContextMenuItem onClick={() => onOpen(document.id)}>
        <Eye className="h-4 w-4 mr-2" />
        Open
      </ContextMenuItem>
      
      {!isDocumentLocked(document) && (
        <>
          <ContextMenuItem onClick={() => onRename(document)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem>
            <Lock className="h-4 w-4 mr-2" />
            Lock Document
          </ContextMenuItem>
        </>
      )}
      
      <ContextMenuSeparator />
      
      <ContextMenuItem>
        <History className="h-4 w-4 mr-2" />
        View History
      </ContextMenuItem>
      
      <ContextMenuItem>
        <MessageCircle className="h-4 w-4 mr-2" />
        Add Comment
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

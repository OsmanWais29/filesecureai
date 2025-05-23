
import { Document } from "@/types/client";
import { Edit2, Eye, History } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { isDocumentLocked } from "../../utils/documentUtils";

interface DocumentActionsProps {
  document: Document;
  onOpen: (documentId: string) => void;
  onRename: (document: Document) => void;
}

export const DocumentActions = ({ document, onOpen, onRename }: DocumentActionsProps) => {
  return (
    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Eye 
              className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(document.id);
              }}
              aria-label="View Document"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>View Document</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {!isDocumentLocked(document) && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Edit2
                className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(document);
                }}
                aria-label="Rename Document"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Rename Document</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <History
              className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                console.log("View history for", document.id);
              }}
              aria-label="View History"
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>View History</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

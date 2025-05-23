
import { Document } from "@/types/client";
import { useState } from "react";
import { DocumentItem } from "./documents/DocumentItem";
import { isForm47or76 } from "../utils/documentUtils";

interface DocumentListItemProps {
  documents: Document[];
  indentationLevel: number;
  onDocumentSelect: (documentId: string) => void;
  onDocumentOpen: (documentId: string) => void;
  onRenameDocument: (document: Document) => void;
  handleDragStart: (id: string, type: 'folder' | 'document') => void;
}

export const DocumentListItem = ({
  documents,
  indentationLevel,
  onDocumentSelect,
  onDocumentOpen,
  onRenameDocument,
  handleDragStart
}: DocumentListItemProps) => {
  // Create indentation based on level
  const indentation = Array(indentationLevel).fill(0).map((_, i) => (
    <div key={i} className="w-6" />
  ));

  // Sort documents: Form 47/76 first, then alphabetically
  const sortedDocuments = [...documents].sort((a, b) => {
    // Check for Form 47 or Form 76 to prioritize them
    const aIsForm47or76 = isForm47or76(a);
    const bIsForm47or76 = isForm47or76(b);
    
    if (aIsForm47or76 && !bIsForm47or76) return -1;
    if (!aIsForm47or76 && bIsForm47or76) return 1;
    
    // If both are forms or both are not forms, sort alphabetically
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="ml-10">
      {sortedDocuments.map(doc => (
        <DocumentItem
          key={doc.id}
          document={doc}
          indentation={indentation}
          onSelect={onDocumentSelect}
          onOpen={onDocumentOpen}
          onRename={onRenameDocument}
          handleDragStart={handleDragStart}
        />
      ))}
    </div>
  );
};

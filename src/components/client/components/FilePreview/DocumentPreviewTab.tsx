
import { FileText, FileQuestion, Download, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Document } from "../../types";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SimpleFilePreview } from "./SimpleFilePreview";

export interface DocumentPreviewTabProps {
  document: Document;
  hasStoragePath: boolean;
  effectiveDocumentId: string;
  getStoragePath: () => string;
  handleDocumentOpen: () => void;
  isLoading: boolean;
}

export const DocumentPreviewTab: React.FC<DocumentPreviewTabProps> = ({
  document,
  hasStoragePath,
  effectiveDocumentId,
  getStoragePath,
  handleDocumentOpen,
  isLoading
}) => {
  const [previewError, setPreviewError] = useState<boolean>(false);
  
  // Get the storage path directly
  const storagePath = document.metadata?.storage_path || document.storage_path || null;
  const isPdf = storagePath?.toLowerCase().endsWith('.pdf') || false;

  // Render PDF preview or document card based on file type and availability
  return (
    <>
      {hasStoragePath ? (
        <div className="h-64 overflow-hidden rounded-md border relative group">
          <SimpleFilePreview
            storagePath={storagePath}
            title={document.title}
            onOpenFull={handleDocumentOpen}
            className="h-full"
          />
        </div>
      ) : (
        // Fallback view when no storage path
        <div className="bg-muted rounded-md p-8 h-64 flex flex-col items-center justify-center">
          <FileQuestion className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center mb-4">
            Document preview not available.
          </p>
          <Button 
            variant="default" 
            className="mt-2"
            onClick={handleDocumentOpen}
            disabled={isLoading}
          >
            {isLoading ? 'Opening...' : 'Open in Document Viewer'}
          </Button>
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Document Information</h4>
        <Card>
          <CardContent className="p-3 text-sm">
            <div className="grid grid-cols-2 gap-y-2">
              <div className="text-muted-foreground">Type:</div>
              <div>{document.type || 'Unknown'}</div>
              
              <div className="text-muted-foreground">Updated:</div>
              <div>{new Date(document.updated_at).toLocaleDateString()}</div>
              
              <div className="text-muted-foreground">Created:</div>
              <div>{new Date(document.created_at).toLocaleDateString()}</div>
              
              <div className="text-muted-foreground">ID:</div>
              <div className="truncate" title={document.id}>{document.id}</div>
              
              {document.metadata && document.metadata.formNumber && (
                <>
                  <div className="text-muted-foreground">Form Number:</div>
                  <div>{document.metadata.formNumber}</div>
                </>
              )}
            </div>
            
            <p className="mt-3">
              This document appears to be a {document.type || 'standard document'} 
              {document.title && document.title.toLowerCase().includes('form') ? ' related to client financial information' : ' related to case details'}.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

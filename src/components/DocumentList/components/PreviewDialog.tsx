
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DocumentPreview from "@/components/DocumentViewer/DocumentPreview";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PreviewDialogProps {
  document: {
    id: string;
    title: string;
    storage_path: string;
  } | null;
  onClose: () => void;
  onAnalysisComplete?: (id: string) => void;
}

const PreviewDialog: React.FC<PreviewDialogProps> = ({ document, onClose, onAnalysisComplete }) => {
  if (!document) return null;

  return (
    <Dialog open={!!document} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-medium truncate pr-8">
            {document.title}
          </DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden mt-4">
          <DocumentPreview 
            storagePath={document.storage_path} 
            documentId={document.id}
            title={document.title}
            onAnalysisComplete={() => {
              if (onAnalysisComplete) {
                onAnalysisComplete(document.id);
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;

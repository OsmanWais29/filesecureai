
import { FileText, Eye, MessageSquare, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document } from "../../types";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentPreviewTab } from "./DocumentPreviewTab";
import { CommentsTab } from "./CommentsTab";
import { ActivityTab } from "./ActivityTab";
import { useState, useEffect, useCallback, memo } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface FilePreviewPanelProps {
  document: Document | null;
  onDocumentOpen: (documentId: string) => void;
}

export const FilePreviewPanel = memo(({ document, onDocumentOpen }: FilePreviewPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileExists, setFileExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the storage path from metadata if present
  const storagePath = document?.metadata?.storage_path || null;

  // Memoize the function to check if file exists
  const checkFileExists = useCallback(async () => {
    if (!storagePath) {
      setFileExists(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const pathParts = storagePath.split('/');
      const fileName = pathParts.pop() || '';
      const folderPath = pathParts.join('/');
      
      // List files to check if our file exists
      const { data: fileList, error: listErr } = await supabase
        .storage
        .from("documents")
        .list(folderPath, { limit: 100, search: fileName });
        
      if (listErr) {
        console.error("Error listing files:", listErr);
        throw listErr;
      }
      
      // Check if file exists with case-insensitive comparison
      const exists = fileList?.some(f => f.name.toLowerCase() === fileName.toLowerCase());
      console.log(`File ${fileName} exists: ${exists}`, fileList);
      
      setFileExists(!!exists);
      
      if (!exists) {
        setError("File not found in storage");
        toast.error("The document file could not be found in storage");
      }
    } catch (err: any) {
      console.error("Error checking file:", err);
      setError(err.message || "Could not check if file exists");
      setFileExists(false);
    } finally {
      setIsLoading(false);
    }
  }, [storagePath]);

  // Check if file exists when document changes
  useEffect(() => {
    if (document) {
      checkFileExists();
    }
  }, [document, checkFileExists]);

  // Memoize handler for document open
  const handleDocumentOpen = useCallback(() => {
    if (document?.id) {
      onDocumentOpen(document.id);
    }
  }, [document?.id, onDocumentOpen]);

  // Standardized prop handling for preview tab
  const hasStoragePath = !!storagePath && fileExists;
  const getStoragePath = useCallback(() => storagePath || "", [storagePath]);
  const effectiveDocumentId = document?.id || "";

  if (!document) {
    return <EmptyDocumentState />;
  }

  return (
    <div className="h-full flex flex-col p-4">
      <DocumentHeader document={document} handleDocumentOpen={handleDocumentOpen} />
      <Tabs defaultValue="preview" className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">
            <FileText className="h-4 w-4 mr-1.5" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-1.5" />
            Activity
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="mt-0 flex-1">
          <DocumentPreviewTab
            document={document}
            hasStoragePath={hasStoragePath}
            effectiveDocumentId={effectiveDocumentId}
            getStoragePath={getStoragePath}
            handleDocumentOpen={handleDocumentOpen}
            isLoading={isLoading}
          />
        </TabsContent>
        <TabsContent value="comments" className="mt-0 flex-1 flex flex-col">
          <CommentsTab 
            document={document}
            effectiveDocumentId={effectiveDocumentId}
          />
        </TabsContent>
        <TabsContent value="history" className="mt-0 flex-1">
          <ActivityTab document={document} />
        </TabsContent>
      </Tabs>
    </div>
  );
});

FilePreviewPanel.displayName = "FilePreviewPanel";

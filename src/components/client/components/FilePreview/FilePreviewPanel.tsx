import { FileText, Eye, MessageSquare, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Document } from "../../types";
import { EmptyDocumentState } from "./EmptyDocumentState";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentPreviewTab } from "./DocumentPreviewTab";
import { CommentsTab } from "./CommentsTab";
import { ActivityTab } from "./ActivityTab";
import { useFilePreview } from "./useFilePreview";

interface FilePreviewPanelProps {
  document: Document | null;
  onDocumentOpen: (documentId: string) => void;
}

export const FilePreviewPanel = ({ document, onDocumentOpen }: FilePreviewPanelProps) => {
  // Use the storage path from metadata if present
  const storagePath = document?.metadata?.storage_path || null;
  const { url: fileUrl, isLoading, error } = useFilePreview(storagePath);

  // Standardized prop handling for preview tab
  const hasStoragePath = !!storagePath;
  const getStoragePath = () => storagePath || "";
  const handleDocumentOpen = () => {
    if (document?.id) {
      onDocumentOpen(document.id);
    }
  };
  const effectiveDocumentId = document?.id || "";

  if (!document) {
    return <EmptyDocumentState />;
  }

  return (
    <div className="h-full flex flex-col p-4">
      <DocumentHeader document={document} handleDocumentOpen={handleDocumentOpen} />
      <Tabs value="preview" className="flex-1 flex flex-col">
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
};

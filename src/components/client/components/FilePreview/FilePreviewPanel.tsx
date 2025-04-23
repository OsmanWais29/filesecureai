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
  // NEW: Pass the appropriate file URL (from document or props) to the hook
  const fileUrl = document?.metadata?.storage_path || null;
  const { url, isLoading, error } = useFilePreview(fileUrl);

  if (!document) {
    return <EmptyDocumentState />;
  }

  return (
    <div className="h-full flex flex-col p-4">
      <DocumentHeader document={document} handleDocumentOpen={onDocumentOpen} />
      
      <Tabs value={"preview"} className="flex-1 flex flex-col">
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
          {/* Pass file preview state as needed */}
          <DocumentPreviewTab
            document={document}
            fileUrl={url}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="comments" className="mt-0 flex-1 flex flex-col">
          <CommentsTab 
            document={document}
            effectiveDocumentId={document?.id || ""}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-0 flex-1">
          <ActivityTab document={document} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

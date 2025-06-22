
import { useEffect, useMemo } from "react";
import { useDocumentViewer } from "./hooks/useDocumentViewer";
import { ViewerLoadingState } from "./components/ViewerLoadingState";
import { ViewerErrorState } from "./components/ViewerErrorState";
import { ViewerNotFoundState } from "./components/ViewerNotFoundState";
import { EnhancedDocumentLayout } from "./EnhancedDocumentLayout";
import { isDocumentForm47 } from "./utils/documentTypeUtils";
import { debugTiming, isDebugMode } from "@/utils/debugMode";
import { DocumentDetails } from "./types";

interface DocumentViewerProps {
  documentId: string;
  bypassProcessing?: boolean;
  documentTitle?: string | null;
  isForm47?: boolean;
  onLoadFailure?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  documentId, 
  bypassProcessing = false,
  documentTitle,
  isForm47 = false,
  onLoadFailure
}) => {
  // Use a stable key for this component to force full remount when documentId changes
  const componentKey = useMemo(() => `document-viewer-${documentId}`, [documentId]);
  
  const loadStart = performance.now();
  const { document, loading, loadingError, handleRefresh, isNetworkError } = useDocumentViewer(documentId);

  useEffect(() => {
    if (document) {
      console.log("Document data loaded:", document.id);
      if (isDebugMode() || bypassProcessing) {
        debugTiming('document-viewer-load', performance.now() - loadStart);
      }
    }
  }, [document, loadStart, bypassProcessing]);

  // Call onLoadFailure when there's an error loading the document
  useEffect(() => {
    if (loadingError && onLoadFailure) {
      console.log("Document load failed, calling onLoadFailure callback");
      onLoadFailure();
    }
  }, [loadingError, onLoadFailure]);

  // For Form 47, we create a mock document if needed
  const form47Document = useMemo(() => {
    if (isForm47 && !document && !loading) {
      const mockDocument: DocumentDetails = {
        id: "form47",
        title: documentTitle || "Form 47 - Consumer Proposal",
        type: "form",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        storage_path: "sample-documents/form-47-consumer-proposal.pdf",
        analysis: [
          {
            id: "form47-analysis",
            content: {
              extracted_info: {
                formNumber: "47",
                formType: "consumer-proposal",
                summary: "This is a form used for consumer proposals under the Bankruptcy and Insolvency Act."
              },
              risks: [
                {
                  type: "Missing Information",
                  description: "Please ensure all required fields are completed.",
                  severity: "medium" as "medium"
                }
              ]
            }
          }
        ],
        comments: [],
        tasks: [],
        versions: []
      };
      return mockDocument;
    }
    return null;
  }, [isForm47, document, loading, documentTitle]);

  if (loading) {
    return <ViewerLoadingState 
      key={`${componentKey}-loading`} 
      onRetry={handleRefresh}
      networkError={isNetworkError}
    />;
  }

  // Special handling for Form 47
  if (isForm47 && !document && form47Document) {
    return (
      <div className="h-full overflow-hidden rounded-lg shadow-sm border border-border/20" key={componentKey}>
        <EnhancedDocumentLayout 
          document={form47Document} 
          documentId="form47"
        />
      </div>
    );
  }

  if (loadingError) {
    return <ViewerErrorState key={`${componentKey}-error`} error={loadingError} onRetry={handleRefresh} />;
  }

  if (!document) {
    return <ViewerNotFoundState key={`${componentKey}-not-found`} />;
  }

  return (
    <div className="h-full overflow-hidden rounded-lg shadow-sm border border-border/20" key={componentKey}>
      <EnhancedDocumentLayout 
        document={document} 
        documentId={documentId}
      />
    </div>
  );
};

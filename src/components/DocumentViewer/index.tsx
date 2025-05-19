import { useEffect, useMemo } from "react";
import DocumentPreview from "./DocumentPreview";
import { useDocumentViewer } from "./hooks/useDocumentViewer";
import { Sidebar } from "./Sidebar";
import { CollaborationPanel } from "./CollaborationPanel";
import { ViewerLayout } from "./layout/ViewerLayout";
import { ViewerLoadingState } from "./components/ViewerLoadingState";
import { ViewerErrorState } from "./components/ViewerErrorState";
import { ViewerNotFoundState } from "./components/ViewerNotFoundState";
import { isDocumentForm47 } from "./utils/documentTypeUtils";
import { TaskManager } from "./TaskManager";
import { VersionTab } from "./VersionTab";
import { debugTiming, isDebugMode } from "@/utils/debugMode";
import { DocumentDetails, Risk } from "./types";

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

  // Function to handle document updates (like comments added)
  const handleDocumentUpdated = () => {
    handleRefresh();
  };

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
            id: "form47-analysis",  // Add the required id property
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
    // Use the mock document for Form 47
    return (
      <div className="h-full overflow-hidden rounded-lg shadow-sm border border-border/20" key={componentKey}>
        <ViewerLayout
          isForm47={true}
          documentTitle={documentTitle || "Form 47 - Consumer Proposal"}
          documentType="form"
          sidebar={
            <Sidebar document={form47Document} onDeadlineUpdated={handleDocumentUpdated} />
          }
          mainContent={
            <DocumentPreview 
              storagePath="sample-documents/form-47-consumer-proposal.pdf" 
              title={documentTitle || "Form 47 - Consumer Proposal"}
              documentId="form47"
              bypassAnalysis={true}
              key={`preview-form47`}
            />
          }
          collaborationPanel={
            <CollaborationPanel document={form47Document} onCommentAdded={handleDocumentUpdated} />
          }
          taskPanel={
            <TaskManager 
              documentId="form47" 
              onTaskUpdate={handleDocumentUpdated} 
            />
          }
          versionPanel={
            <VersionTab 
              documentId="form47"
              versions={[]}
            />
          }
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

  // If isForm47 is explicitly passed as prop, use that, otherwise check from document
  const isForm47Document = isForm47 || isDocumentForm47(document);
  // Use passed documentTitle if available, otherwise use the one from document
  const displayTitle = documentTitle || document.title;

  // Ensure versions have storage_path by adding an empty string for any missing paths
  const adaptVersions = (versions = []) => {
    return versions.map(version => ({
      ...version,
      storage_path: version.storage_path || ''
    }));
  };

  return (
    <div className="h-full overflow-hidden rounded-lg shadow-sm border border-border/20" key={componentKey}>
      <ViewerLayout
        isForm47={isForm47Document}
        documentTitle={displayTitle}
        documentType={document.type}
        sidebar={
          <Sidebar document={document} onDeadlineUpdated={handleDocumentUpdated} />
        }
        mainContent={
          <DocumentPreview 
            storagePath={document.storage_path} 
            title={displayTitle}
            documentId={documentId}
            bypassAnalysis={bypassProcessing || isDebugMode()}
            key={`preview-${documentId}`}
          />
        }
        collaborationPanel={
          <CollaborationPanel document={document} onCommentAdded={handleDocumentUpdated} />
        }
        taskPanel={
          <TaskManager 
            documentId={documentId} 
            onTaskUpdate={handleDocumentUpdated} 
          />
        }
        versionPanel={
          <VersionTab 
            documentId={documentId}
            versions={adaptVersions(document.versions)}
          />
        }
      />
    </div>
  );
};

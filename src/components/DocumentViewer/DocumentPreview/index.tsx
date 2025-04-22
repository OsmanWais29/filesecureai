
import React, { useEffect } from "react";
import { usePreviewState } from "./hooks/usePreviewState";
import { DocumentPreviewContent } from "./components/DocumentPreviewContent";
import { AnalysisProgress } from "./components/AnalysisProgress";
import { EnhancedPDFViewer } from "./components/EnhancedPDFViewer";
import { startJwtMonitoring, stopJwtMonitoring } from "@/utils/jwtMonitoring";

interface DocumentPreviewProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  bypassAnalysis?: boolean;
  onAnalysisComplete?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  storagePath, 
  documentId, 
  title = "Document Preview",
  bypassAnalysis = false,
  onAnalysisComplete
}) => {
  const previewState = usePreviewState({ storagePath });
  
  const {
    fileType,
    isLoading,
    fileExists,
    error: previewError
  } = previewState;
  
  const isPdf = fileType === 'pdf';
  
  // Start JWT monitoring when component mounts
  useEffect(() => {
    // Start JWT monitoring
    startJwtMonitoring();
    
    // Clean up when component unmounts
    return () => {
      stopJwtMonitoring();
    };
  }, []);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document preview...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (previewError || !fileExists) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-2">Document Not Available</h3>
          <p className="text-muted-foreground">
            {previewError || "The requested document could not be loaded."}
          </p>
        </div>
      </div>
    );
  }
  
  // Handle PDF specially with our enhanced viewer
  if (isPdf) {
    return (
      <div className="h-full">
        {/* Analytics process shown only if document has an ID and analysis is not bypassed */}
        {documentId && !bypassAnalysis && (
          <AnalysisProgress 
            documentId={documentId} 
            onComplete={onAnalysisComplete}
          />
        )}
        
        <EnhancedPDFViewer 
          storagePath={storagePath} 
          title={title}
          zoomLevel={100}
        />
      </div>
    );
  }
  
  // For other document types, use the standard preview content
  return (
    <div className="h-full">
      {documentId && !bypassAnalysis && (
        <AnalysisProgress 
          documentId={documentId} 
          onComplete={onAnalysisComplete}
        />
      )}
      
      <DocumentPreviewContent
        storagePath={storagePath}
        documentId={documentId}
        title={title}
        previewState={previewState}
      />
    </div>
  );
};

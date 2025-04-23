
import React, { useEffect } from "react";
import usePreviewState from "./hooks/usePreviewState";
import { DocumentPreviewContent } from "./components/DocumentPreviewContent";
import { AnalysisProgress } from "./components/AnalysisProgress";
import { EnhancedPDFViewer } from "./components/EnhancedPDFViewer";
import { startJwtMonitoring, stopJwtMonitoring } from "@/utils/jwtMonitoring";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, RefreshCw, Wifi } from "lucide-react";

interface DocumentPreviewProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  bypassAnalysis?: boolean;
  onAnalysisComplete?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  storagePath, 
  documentId = "", 
  title = "Document Preview",
  bypassAnalysis = false,
  onAnalysisComplete
}) => {
  // Use the enhanced hook with correct parameters
  const previewState = usePreviewState(
    storagePath,
    documentId,
    title,
    onAnalysisComplete,
    bypassAnalysis
  );
  
  const {
    fileUrl,
    isLoading,
    fileExists,
    fileType,
    previewError,
    analyzing,
    analysisStep,
    progress,
    processingStage,
    handleAnalysisRetry,
    handleFullRecovery,
    forceRefresh,
    networkStatus,
    errorDetails
  } = previewState;
  
  const isPdf = fileType === 'pdf';
  const isNetworkOffline = networkStatus === 'offline';
  
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
          {isNetworkOffline && (
            <div className="mt-2 text-sm text-amber-500 flex items-center justify-center">
              <Wifi className="h-4 w-4 mr-1" />
              Waiting for connection...
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Show enhanced error state with recovery options
  if (previewError || !fileExists) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center max-w-md px-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Document Not Available</h3>
          <p className="text-muted-foreground mb-6">
            {previewError || "The requested document could not be loaded."}
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              variant="default" 
              className="w-full flex items-center justify-center" 
              onClick={forceRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Document
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center" 
              onClick={handleFullRecovery}
            >
              <Shield className="h-4 w-4 mr-2" />
              Try Full Recovery
            </Button>
          </div>
          
          {/* Network status indicator */}
          {isNetworkOffline && (
            <div className="mt-4 py-2 px-3 bg-amber-50 text-amber-800 rounded-md text-sm">
              <div className="flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                <span>Network appears to be offline. Document will reload when connection is restored.</span>
              </div>
            </div>
          )}
          
          {/* Error details for debugging - only in development */}
          {process.env.NODE_ENV === 'development' && errorDetails && (
            <div className="mt-4 p-3 bg-slate-100 rounded text-xs text-left">
              <details>
                <summary className="cursor-pointer text-sm font-medium mb-1">Debug Information</summary>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify({
                    errorType: errorDetails.errorType,
                    attempts: errorDetails.attempts,
                    remainingAttempts: errorDetails.remainingAttempts,
                    networkStatus,
                    storagePath
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Handle PDF specially with our enhanced viewer
  if (isPdf) {
    return (
      <div className="h-full">
        {/* Analytics process shown only if document has an ID and analysis is not bypassed */}
        {documentId && !bypassAnalysis && analyzing && (
          <AnalysisProgress 
            documentId={documentId}
            progress={progress}
            analysisStep={analysisStep}
            processingStage={processingStage}
            onComplete={onAnalysisComplete}
            onRetry={handleAnalysisRetry}
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
      {documentId && !bypassAnalysis && analyzing && (
        <AnalysisProgress 
          documentId={documentId}
          progress={progress}
          analysisStep={analysisStep}
          processingStage={processingStage}
          onComplete={onAnalysisComplete}
          onRetry={handleAnalysisRetry}
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

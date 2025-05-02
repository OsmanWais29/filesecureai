
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PDFViewer } from "./PDFViewer";
import { ErrorDisplay } from "./ErrorDisplay";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ViewerToolbar } from "./ViewerToolbar";
import { NetworkStatusIndicator } from "./NetworkStatusIndicator";
import { useNetworkResilience } from "../hooks/useNetworkResilience";
import { DocumentPreviewContentProps } from "../types";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";

export interface DocumentPreviewContentProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  previewState: any;
}

export const DocumentPreviewContent: React.FC<DocumentPreviewContentProps> = ({
  storagePath,
  documentId,
  title,
  previewState
}) => {
  const {
    fileExists,
    fileUrl,
    previewError,
    setPreviewError,
    checkFile,
    isLoading,
    isExcelFile,
    networkStatus,
    attemptCount
  } = previewState;

  const [zoomLevel, setZoomLevel] = useState(100);
  const [isRetrying, setIsRetrying] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [useFallbackViewer, setUseFallbackViewer] = useState(false);
  
  const { 
    isOnline, 
    resetRetries, 
    incrementRetry,
    shouldRetry 
  } = useNetworkResilience(storagePath);

  useEffect(() => {
    // If preview fails multiple times, try fallback viewer
    if (attemptCount > 2 && fileUrl && !useFallbackViewer) {
      setUseFallbackViewer(true);
      toast.info("Trying alternative document viewer...");
    }
  }, [attemptCount, fileUrl, useFallbackViewer]);

  // Handle file check errors
  useEffect(() => {
    if (previewError && shouldRetry({ message: previewError })) {
      console.log("Automatically retrying file check due to error:", previewError);
      const timeout = setTimeout(() => {
        checkFile();
        incrementRetry();
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [previewError, checkFile, shouldRetry, incrementRetry]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleOpenInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
      toast.success("Document opened in new tab");
    }
  };

  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = title || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handlePrint = () => {
    if (fileUrl) {
      const printWindow = window.open(fileUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
      toast.success("Print dialog opened");
    }
  };

  const handleRefresh = async () => {
    setIsRetrying(true);
    resetRetries();
    toast.info("Refreshing document preview...");
    
    // Clear any fallback viewer state
    setUseFallbackViewer(false);
    
    try {
      await checkFile();
      setForceReload(prev => prev + 1);
      toast.success("Document refreshed");
    } catch (error) {
      console.error("Error refreshing:", error);
      toast.error("Failed to refresh document");
    } finally {
      setIsRetrying(false);
    }
  };
  
  const getFallbackViewerUrl = () => {
    if (!fileUrl) return '';
    // Use Google Docs Viewer as fallback
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  if (!storagePath) {
    return <ErrorDisplay error="No document selected" onRetry={() => {}} />;
  }

  // Show loading state when document is loading
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document preview...</p>
        </div>
      </div>
    );
  }

  // Special handling for Excel files
  if (isExcelFile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-3">Excel Preview Not Available</h3>
          <p className="text-muted-foreground mb-6">
            Excel files cannot be previewed in the browser. Please download the file to view it.
          </p>
          {fileUrl && (
            <Button
              onClick={handleDownload}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel File
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Alternative viewer when standard PDF viewer fails
  const renderDocumentViewer = () => {
    if (!fileExists || !fileUrl) {
      return (
        <div className="h-full flex items-center justify-center p-8 bg-muted rounded-md">
          <ErrorDisplay 
            error={previewError || "Document preview not available. Please try refreshing or check storage path."}
            onRetry={handleRefresh}
          />
        </div>
      );
    }
    
    if (useFallbackViewer) {
      return (
        <div className="relative h-full w-full flex flex-col">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 text-sm text-center">
            Using alternative viewer due to loading issues. 
            <Button variant="link" className="px-1 py-0 h-auto" onClick={() => setUseFallbackViewer(false)}>
              Try standard viewer
            </Button>
          </div>
          <iframe
            src={getFallbackViewerUrl()}
            className="w-full flex-1"
            title={title || "Document Preview"}
          />
          <div className="absolute top-1 right-1">
            <Button size="sm" variant="outline" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <PDFViewer
        fileUrl={fileUrl}
        title={title}
        zoomLevel={zoomLevel}
        onLoad={() => setPreviewError(null)}
        onError={() => {
          setPreviewError("Error loading document");
          // Auto-switch to fallback viewer on error
          setUseFallbackViewer(true);
        }}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ViewerToolbar 
        title={title}
        zoomLevel={zoomLevel}
        isRetrying={isRetrying}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRefresh={handleRefresh}
        onOpenInNewTab={handleOpenInNewTab}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />
      
      <div className="flex-1 overflow-hidden relative">
        {renderDocumentViewer()}
      </div>
      
      <NetworkStatusIndicator 
        isOnline={networkStatus === 'online'} 
        onRetry={handleRefresh}
        attemptCount={attemptCount}
      />
    </div>
  );
};

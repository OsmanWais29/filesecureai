
import React, { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AlertTriangle, Download, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface PDFViewerProps {
  fileUrl: string | null;
  title?: string;
  zoomLevel?: number;
  onLoad?: () => void;
  onError?: () => void;
  indicateNetworkErrors?: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  title = "Document",
  zoomLevel = 100,
  onLoad,
  onError,
  indicateNetworkErrors = true
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);
  const { isOnline } = useNetworkStatus();

  // Cache-bust the URL to ensure fresh content
  const cacheBustedUrl = fileUrl ? `${fileUrl}?t=${Date.now()}-${forceReload}` : '';
  const googleDocsViewerUrl = fileUrl ? 
    `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` : '';
    
  useEffect(() => {
    console.log("PDFViewer received fileUrl:", fileUrl);
    
    // Reset loading state when URL changes
    if (fileUrl) {
      setIsLoading(true);
      setLoadError(null);
      setRetryCount(0);
    }
  }, [fileUrl, forceReload]);

  const handleLoadSuccess = () => {
    console.log("PDF loaded successfully");
    setIsLoading(false);
    setLoadError(null);
    setRetryCount(0);
    if (onLoad) onLoad();
  };

  const handleLoadError = () => {
    console.error("Error loading PDF:", fileUrl);
    
    setRetryCount(prev => prev + 1);
    
    // First retry immediately without changing modes
    if (retryCount === 0) {
      console.log("First load failed, retrying immediately");
      setForceReload(prev => prev + 1);
      return;
    }
    
    // After first retry fails, switch to Google Docs viewer
    if (!useGoogleViewer && retryCount >= 1) {
      console.log("Falling back to Google Docs viewer");
      setUseGoogleViewer(true);
      setIsLoading(true);
    } else if (useGoogleViewer && retryCount >= 2) {
      // Both methods failed
      setIsLoading(false);
      let errorMsg = "Could not load the document. It may be in an unsupported format or inaccessible.";
      if (indicateNetworkErrors && !isOnline) {
        errorMsg = "Network connection issue. Please check your internet connection and try again.";
      }
      setLoadError(errorMsg);
      if (onError) onError();
    }
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

  const handleRetry = () => {
    setUseGoogleViewer(false);
    setLoadError(null);
    setIsLoading(true);
    setRetryCount(0);
    setForceReload(prev => prev + 1);
  };

  if (!fileUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <p className="text-muted-foreground">No document URL provided</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Document Load Error</h3>
          <p className="text-muted-foreground mb-6">{loadError}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={handleOpenInNewTab} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button variant="outline" onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <LoadingSpinner size="large" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Loading document...</p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {retryCount === 1 ? "Retrying..." : 
                 useGoogleViewer ? "Using alternative viewer..." : 
                 "Attempting direct view..."}
              </p>
            )}
          </div>
        </div>
      )}

      {useGoogleViewer ? (
        <iframe
          src={googleDocsViewerUrl}
          className="w-full h-full border-0"
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          title={`Google Docs viewer: ${title}`}
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      ) : (
        <object
          ref={objectRef}
          data={cacheBustedUrl}
          type="application/pdf"
          className="w-full h-full"
          style={{transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top'}}
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
        >
          <iframe
            ref={iframeRef}
            src={cacheBustedUrl}
            className="w-full h-full border-0"
            title={`Document Preview: ${title}`}
            style={{transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top'}}
            onLoad={handleLoadSuccess}
            onError={handleLoadError}
            sandbox="allow-same-origin allow-scripts allow-forms"
            referrerPolicy="no-referrer"
            allow="fullscreen"
          />
        </object>
      )}
    </div>
  );
};

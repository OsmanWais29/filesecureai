
import React, { useState, useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AlertTriangle, Download, ExternalLink, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getPdfViewUrl, PdfLoadResult } from "@/utils/pdfViewer";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface UniversalPDFViewerProps {
  storagePath: string;
  bucketName?: string;
  title?: string;
  zoomLevel?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const UniversalPDFViewer: React.FC<UniversalPDFViewerProps> = ({
  storagePath,
  bucketName = "documents",
  title = "Document",
  zoomLevel = 100,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pdfResult, setPdfResult] = useState<PdfLoadResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const objectRef = useRef<HTMLObjectElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isOnline } = useNetworkStatus();
  
  // Load PDF on component mount
  useEffect(() => {
    if (!storagePath) return;
    
    async function loadPdf() {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Try to load PDF with preferred method
        const result = await getPdfViewUrl(storagePath, bucketName, {
          maxRetries: 2,
          cacheBust: true,
          forceGoogleViewer: retryCount >= 2
        });
        
        if (result.success && result.url) {
          setPdfResult(result);
          setIsLoading(false);
          if (onLoad) onLoad();
        } else {
          throw new Error(result.error?.toString() || "Failed to load PDF");
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        setRetryCount(prev => prev + 1);
        
        if (retryCount >= 3) {
          setIsLoading(false);
          setLoadError(error instanceof Error ? error.message : String(error));
          if (onError) onError(error);
        } else {
          // Retry with different parameters
          loadPdf();
        }
      }
    }
    
    loadPdf();
  }, [storagePath, bucketName, retryCount]);
  
  // Monitor network status
  useEffect(() => {
    if (isOnline && loadError && loadError.includes("network")) {
      // Network is back online, retry loading
      handleRetry();
    }
  }, [isOnline, loadError]);
  
  const handleLoadSuccess = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };
  
  const handleLoadError = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
    } else {
      setIsLoading(false);
      let errorMsg = "Could not display the PDF. It might be in an unsupported format or inaccessible.";
      if (!isOnline) {
        errorMsg = "Network connection issue. Please check your internet connection and try again.";
      }
      setLoadError(errorMsg);
      if (onError) onError(new Error(errorMsg));
    }
  };
  
  const handleOpenInNewTab = () => {
    if (pdfResult?.url) {
      window.open(pdfResult.url, '_blank');
      toast.success("Document opened in new tab");
    }
  };
  
  const handleDownload = () => {
    if (pdfResult?.url) {
      const link = document.createElement('a');
      link.href = pdfResult.url;
      link.download = title || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };
  
  const handleRetry = () => {
    setLoadError(null);
    setIsLoading(true);
    setRetryCount(0);
    setPdfResult(null);
  };
  
  if (!storagePath) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <p className="text-muted-foreground">No document path provided</p>
      </div>
    );
  }
  
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center max-w-md p-6">
          <div className="p-2 bg-destructive/10 rounded-full inline-block mb-3">
            {!isOnline ? (
              <WifiOff className="h-6 w-6 text-destructive" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
          </div>
          
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
          
          {!isOnline && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <p className="text-sm text-amber-800">You appear to be offline. The document will load when your connection is restored.</p>
            </div>
          )}
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
                {retryCount === 1 ? "Trying again..." : 
                pdfResult?.method === 'google' ? "Using Google Viewer..." : 
                "Trying alternative methods..."}
              </p>
            )}
          </div>
        </div>
      )}
      
      {pdfResult?.method === 'google' ? (
        <iframe
          src={pdfResult.url || ''}
          className="w-full h-full border-0"
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          title={`Google Docs viewer: ${title}`}
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      ) : pdfResult?.url && (
        <object
          ref={objectRef}
          data={pdfResult.url}
          type="application/pdf"
          className="w-full h-full"
          style={{transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top'}}
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
        >
          <iframe
            ref={iframeRef}
            src={pdfResult.url}
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

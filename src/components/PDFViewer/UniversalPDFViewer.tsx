
import React, { useState, useEffect } from "react";
import { usePdfViewer } from "@/hooks/usePdfViewer";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw, ExternalLink, AlertTriangle, WifiOff } from "lucide-react";
import { toast } from "sonner";

interface UniversalPDFViewerProps {
  storagePath: string;
  bucketName?: string;
  title: string;
  zoomLevel?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const UniversalPDFViewer = ({
  storagePath,
  bucketName = "documents",
  title,
  zoomLevel = 1,
  onLoad,
  onError
}: UniversalPDFViewerProps) => {
  const [attemptedFallback, setAttemptedFallback] = useState(false);
  const { isOnline } = useNetworkStatus();
  
  // Use our PDF viewer hook to handle the loading and url generation
  const {
    pdfUrl,
    fileExists,
    isLoading,
    error,
    retry,
    retryWithFallback,
    pdfResult
  } = usePdfViewer(storagePath, {
    bucketName,
    onSuccess: (result) => {
      console.log("PDF loaded successfully:", result.method);
      if (onLoad) onLoad();
    },
    onError: (err) => {
      console.error("PDF loading error:", err);
      if (onError) onError(err);
    }
  });
  
  // Make sure to inform the user if they're offline
  useEffect(() => {
    if (!isOnline && !isLoading) {
      toast.error("You appear to be offline. PDF loading may fail until your connection is restored.");
    }
  }, [isOnline]);
  
  // Create a function to handle retrying with fallback
  const handleRetryWithFallback = () => {
    setAttemptedFallback(true);
    retryWithFallback();
    toast.info("Trying alternative PDF viewing method...");
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 border rounded-md p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-muted-foreground text-center">Loading PDF...</p>
      </div>
    );
  }
  
  if (error || !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 border rounded-md p-6 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h3 className="font-semibold text-xl">Failed to load PDF</h3>
        
        <div className="text-center text-muted-foreground mb-2">
          {!isOnline ? (
            <div className="flex flex-col items-center gap-2">
              <WifiOff className="h-6 w-6 text-destructive" />
              <p>You are currently offline. Please check your internet connection.</p>
            </div>
          ) : !fileExists ? (
            <p>The requested PDF file does not exist or you don't have permission to view it.</p>
          ) : (
            <p>{error?.message || "There was an error loading this PDF."}</p>
          )}
        </div>
        
        <div className="flex flex-row gap-2 mt-2">
          <Button onClick={retry} size="sm" variant="outline" disabled={!isOnline}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          
          {!attemptedFallback && isOnline && (
            <Button onClick={handleRetryWithFallback} size="sm" variant="default">
              <ExternalLink className="h-4 w-4 mr-2" /> 
              Try Alternative Viewer
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Use an iframe for PDFs to maximize compatibility
  return (
    <div className="w-full h-full rounded-md overflow-hidden border">
      {pdfResult?.method === 'google' ? (
        // Google Docs Viewer (for fallback)
        <iframe 
          src={pdfUrl}
          title={title}
          className="w-full h-full"
          style={{ border: "none" }}
        />
      ) : (
        // Direct PDF via iframe or object
        <iframe
          src={pdfUrl}
          title={title}
          className="w-full h-full"
          style={{ border: "none" }}
          onLoad={() => {
            console.log('PDF iframe loaded');
            if (onLoad) onLoad();
          }}
          onError={(e) => {
            console.error('PDF iframe error:', e);
            handleRetryWithFallback();
          }}
        />
      )}
    </div>
  );
};

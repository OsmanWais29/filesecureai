
import React, { useState, useEffect, useRef, useCallback } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { AlertTriangle, Download, ExternalLink, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { checkAndRefreshToken } from "@/utils/jwtMonitoring";
import { refreshSession } from "@/hooks/useAuthState";

interface EnhancedPDFViewerProps {
  storagePath: string;
  bucketName?: string;
  title: string;
  zoomLevel: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const EnhancedPDFViewer: React.FC<EnhancedPDFViewerProps> = ({
  storagePath,
  bucketName = "documents",
  title,
  zoomLevel = 100,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);
  const maxRetries = 3;
  
  // Enhanced fetch function with retry logic
  const fetchSignedUrl = useCallback(async (forceRefresh = false): Promise<string | null> => {
    try {
      console.group("📄 Fetching PDF signed URL");
      setIsRefreshingToken(forceRefresh);
      
      // If we're forcing a refresh, first explicitly refresh the token
      if (forceRefresh) {
        console.log("Forcing token refresh before fetching URL");
        const refreshed = await refreshSession();
        if (!refreshed) {
          throw new Error("Failed to refresh authentication session");
        }
      }
      
      // Check token validity
      const tokenResult = await checkAndRefreshToken();
      if (!tokenResult.isValid) {
        console.error("Invalid token when fetching PDF:", tokenResult.reason);
        
        // Attempt to recover by explicitly refreshing the session
        console.log("Attempting to refresh session to recover");
        const sessionRefreshed = await refreshSession();
        if (!sessionRefreshed) {
          throw new Error(`Authentication error: ${tokenResult.reason}`);
        }
      }
      
      console.log("Using bucket:", bucketName, "path:", storagePath);
      
      // Get signed URL with fresh token - use a longer validity period
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(storagePath, 60 * 30); // 30 minutes validity
      
      if (error) {
        console.error("Error getting signed URL:", error);
        throw error;
      }
      
      if (!data?.signedUrl) {
        console.error("No signed URL returned");
        throw new Error("Failed to generate signed URL for document");
      }
      
      console.log("Signed URL generated successfully");
      console.groupEnd();
      setIsRefreshingToken(false);
      return data.signedUrl;
    } catch (error) {
      console.error("Failed to get signed URL:", error);
      console.groupEnd();
      setIsRefreshingToken(false);
      return null;
    }
  }, [bucketName, storagePath]);

  // Advanced load PDF function with retries
  const loadPdfWithRetries = useCallback(async () => {
    if (!storagePath) return;
    
    setIsLoading(true);
    setLoadError(null);
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Force token refresh on retry attempts
        const forceRefresh = attempt > 0;
        console.log(`PDF fetch attempt ${attempt + 1}${forceRefresh ? " (with token refresh)" : ""}`);
        
        const url = await fetchSignedUrl(forceRefresh);
        if (!url) {
          throw new Error("Failed to retrieve document URL");
        }
        
        setFileUrl(url);
        // If we got a URL, break the retry loop
        break;
      } catch (error: any) {
        console.error(`Error loading PDF (attempt ${attempt + 1}/${maxRetries}):`, error);
        
        // Last attempt failed
        if (attempt === maxRetries - 1) {
          setLoadError(error instanceof Error ? error.message : "Failed to load document after multiple attempts");
          if (onError) onError(error);
          setIsLoading(false);
        } else {
          // Wait before retry with increasing delay (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s...
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }, [storagePath, fetchSignedUrl, maxRetries, onError]);

  // Load the PDF on component mount
  useEffect(() => {
    loadPdfWithRetries();
  }, [loadPdfWithRetries]);

  // Handle success and error states during viewing
  const handleLoadSuccess = () => {
    setIsLoading(false);
    setLoadError(null);
    setRetryCount(0);
    if (onLoad) onLoad();
  };

  const handleLoadError = async () => {
    console.error("Error displaying PDF:", fileUrl);
    
    setRetryCount(prev => prev + 1);
    
    // First retry immediately with a fresh URL
    if (retryCount === 1) {
      console.log("First display attempt failed, retrying with fresh URL...");
      
      // Get a fresh URL with forced token refresh
      const freshUrl = await fetchSignedUrl(true);
      if (freshUrl) {
        console.log("Obtained fresh URL, retrying PDF load");
        setFileUrl(freshUrl);
        return;
      }
    }
    
    // After first retry fails, switch to Google Docs viewer
    if (!useGoogleViewer && retryCount >= 2) {
      console.log("Falling back to Google Docs viewer");
      setUseGoogleViewer(true);
      setIsLoading(true);
    } else if (useGoogleViewer && retryCount >= 3) {
      // Both methods failed
      setIsLoading(false);
      setLoadError("Could not load the document. It may be inaccessible or in an unsupported format.");
      if (onError) onError(new Error("PDF display failed after multiple attempts"));
    }
  };

  const handleOpenInNewTab = async () => {
    try {
      // Always get fresh URL before opening
      const freshUrl = await fetchSignedUrl(true);
      if (freshUrl) {
        window.open(freshUrl, '_blank', 'noopener,noreferrer');
        toast.success("Document opened in new tab");
      } else {
        throw new Error("Failed to generate document URL");
      }
    } catch (error) {
      toast.error("Failed to open document in new tab");
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      // Get fresh URL for download
      const freshUrl = await fetchSignedUrl(true);
      if (!freshUrl) {
        throw new Error("Failed to generate document URL for download");
      }
      
      const response = await fetch(freshUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      // Get file as blob
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = title || 'document.pdf';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(downloadUrl);
      
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    // Reset state
    setUseGoogleViewer(false);
    setLoadError(null);
    setIsLoading(true);
    setRetryCount(0);
    
    // Full retry with token refresh
    await loadPdfWithRetries();
    toast.info("Refreshing document...");
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

  const cacheBustedUrl = fileUrl ? `${fileUrl}&t=${Date.now()}` : '';
  const googleDocsViewerUrl = fileUrl ? 
    `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` : '';

  return (
    <div className="relative w-full h-full">
      {(isLoading || isRefreshingToken) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <LoadingSpinner size="large" className="mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isRefreshingToken ? "Refreshing authentication..." : "Loading document..."}
            </p>
            {retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {retryCount === 1 ? "Retrying..." : 
                 useGoogleViewer ? "Using alternative viewer..." : 
                 "Attempting direct view..."}
              </p>
            )}
            {isRefreshingToken && (
              <div className="flex items-center justify-center mt-2">
                <Shield className="h-4 w-4 text-primary mr-2" />
                <p className="text-xs text-muted-foreground">Securing document access</p>
              </div>
            )}
          </div>
        </div>
      )}

      {fileUrl && useGoogleViewer ? (
        <iframe
          src={googleDocsViewerUrl}
          className="w-full h-full border-0"
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          title={`Google Docs viewer: ${title}`}
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      ) : fileUrl && (
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

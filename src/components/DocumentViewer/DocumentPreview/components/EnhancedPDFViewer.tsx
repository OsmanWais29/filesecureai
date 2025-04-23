
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
  const [forceReload, setForceReload] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);
  const [isNetworkOffline, setIsNetworkOffline] = useState(!navigator.onLine);
  const [hasTriedTokenRefresh, setHasTriedTokenRefresh] = useState(false);
  const [hasTriedPublicUrl, setHasTriedPublicUrl] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network came online');
      setIsNetworkOffline(false);
      if (retryCount > 0) {
        handleRetry();
      }
    };
    
    const handleOffline = () => {
      console.log('Network went offline');
      setIsNetworkOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retryCount]);

  // Load the PDF on component mount or when path changes
  useEffect(() => {
    if (!storagePath) return;
    
    console.log(`Loading document from path: ${storagePath}`);
    loadPdfWithFallbacks();
  }, [storagePath, forceReload]);

  // Main function to load PDF with all fallbacks
  const loadPdfWithFallbacks = useCallback(async () => {
    if (!storagePath) return;
    
    setIsLoading(true);
    setLoadError(null);
    console.log(`PDF load attempt ${retryCount + 1} for ${storagePath}`);
    
    try {
      // First get a fresh auth token
      if (retryCount > 0 || hasTriedTokenRefresh) {
        console.log('Refreshing authentication token...');
        try {
          await refreshSession();
          await checkAndRefreshToken();
        } catch (e) {
          console.warn('Token refresh failed:', e);
        }
        setHasTriedTokenRefresh(true);
      }

      // Try to get a signed URL
      console.log(`Attempting to get signed URL for ${storagePath}`);
      const { data: urlData, error: urlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(storagePath, 3600);
        
      if (urlError) {
        console.error('Signed URL error:', urlError);
        throw urlError;
      }
      
      if (urlData?.signedUrl) {
        console.log('Successfully generated signed URL');
        setFileUrl(urlData.signedUrl);
        setIsLoading(false);
        return;
      }
      
      throw new Error('No signed URL returned');
    } catch (error: any) {
      // Signed URL failed, try to get public URL
      if (!hasTriedPublicUrl) {
        console.log('Trying to get public URL as fallback');
        const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
        
        if (data?.publicUrl) {
          console.log('Got public URL, using that instead');
          setPublicUrl(data.publicUrl);
          setFileUrl(data.publicUrl);
          setHasTriedPublicUrl(true);
          setIsLoading(false);
          return;
        }
      }
      
      // If we've already tried both signed and public URLs, try Google Viewer for PDFs
      const isPdf = storagePath.toLowerCase().endsWith('.pdf');
      if (isPdf && publicUrl && !useGoogleViewer) {
        console.log('Trying Google Docs viewer as final fallback');
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicUrl)}&embedded=true`;
        setFileUrl(googleViewerUrl);
        setUseGoogleViewer(true);
        setIsLoading(false);
        return;
      }
      
      // All attempts failed
      console.error('All PDF loading attempts failed:', error);
      setLoadError(`Could not load the document. ${error.message || 'It may be inaccessible.'}${isNetworkOffline ? ' (You appear to be offline)' : ''}`);
      setIsLoading(false);
      if (onError) onError(error);
    }
  }, [storagePath, retryCount, bucketName, hasTriedTokenRefresh, hasTriedPublicUrl, publicUrl, useGoogleViewer, isNetworkOffline, onError]);

  const handleLoadSuccess = () => {
    console.log("PDF loaded successfully");
    setIsLoading(false);
    setLoadError(null);
    setRetryCount(0);
    if (onLoad) onLoad();
  };

  const handleLoadError = () => {
    console.error("Error displaying PDF:", fileUrl);
    
    setRetryCount(prev => prev + 1);
    
    if (retryCount < 3) {
      console.log(`Display attempt ${retryCount + 1} failed, trying again...`);
      loadPdfWithFallbacks();
    } else {
      setIsLoading(false);
      setLoadError("Could not display the document after multiple attempts. It may be in an unsupported format.");
      if (onError) onError(new Error("PDF display failed after multiple attempts"));
    }
  };

  const handleOpenInNewTab = () => {
    const url = fileUrl || publicUrl;
    if (url) {
      window.open(url, '_blank');
      toast.success("Document opened in new tab");
    }
  };

  const handleDownload = () => {
    const url = fileUrl || publicUrl;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
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
    setHasTriedTokenRefresh(false);
    setHasTriedPublicUrl(false);
    setForceReload(prev => prev + 1);
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
          
          {isNetworkOffline && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
              <p className="text-sm text-amber-800">You appear to be offline. The document will load when your connection is restored.</p>
            </div>
          )}
          
          {retryCount > 2 && (
            <div className="mt-4 p-3 bg-muted border border-border rounded-md">
              <p className="text-xs text-muted-foreground">
                Error details: {loadError}
                <br/>
                Storage path: {storagePath}
                <br/>
                Attempts: {retryCount}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const cacheBustedUrl = fileUrl ? `${fileUrl}?t=${Date.now()}-${forceReload}` : '';
  const googleDocsViewerUrl = useGoogleViewer && fileUrl ? 
    `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true` : fileUrl;

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
                 hasTriedTokenRefresh ? "Refreshing authentication..." :
                 "Attempting direct view..."}
              </p>
            )}
            {hasTriedTokenRefresh && (
              <div className="flex items-center justify-center mt-2">
                <Shield className="h-4 w-4 text-primary mr-2" />
                <p className="text-xs text-muted-foreground">Refreshing authentication</p>
              </div>
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


import React, { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertTriangle, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PDFViewerEmbedProps {
  fileUrl: string | null;
  title: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const PDFViewerEmbed: React.FC<PDFViewerEmbedProps> = ({
  fileUrl,
  title,
  onLoad,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<'direct' | 'iframe' | 'google'>('direct');
  const [retryCount, setRetryCount] = useState(0);
  const objectRef = useRef<HTMLObjectElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const maxRetries = 3;
  
  // Add a cache-busting parameter to prevent caching issues
  const effectiveUrl = fileUrl ? `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : null;
  
  // Create Google Docs viewer URL
  const googleDocsUrl = effectiveUrl ? 
    `https://docs.google.com/viewer?url=${encodeURIComponent(effectiveUrl)}&embedded=true` : '';
  
  // Reset loading state when URL changes
  useEffect(() => {
    if (fileUrl) {
      setIsLoading(true);
      setLoadError(null);
      setRetryCount(0);
      setViewerMode('direct');
      console.log(`Attempting to load PDF: ${fileUrl}`);
    }
  }, [fileUrl]);

  // Handler for successful loading
  const handleLoadSuccess = () => {
    console.log(`PDF loaded successfully in ${viewerMode} mode`);
    setIsLoading(false);
    setLoadError(null);
    setRetryCount(0);
    if (onLoad) onLoad();
  };

  // Handler for loading errors with progressive fallback
  const handleLoadError = () => {
    console.error(`Error displaying PDF in ${viewerMode} mode:`, effectiveUrl);
    setRetryCount(prev => prev + 1);
    
    // If we've reached max retries in the current mode, try next mode
    if (retryCount >= maxRetries - 1) {
      if (viewerMode === 'direct') {
        console.log('Falling back to iframe mode');
        setViewerMode('iframe');
        setRetryCount(0);
      } else if (viewerMode === 'iframe') {
        console.log('Falling back to Google Docs viewer');
        setViewerMode('google');
        setRetryCount(0);
      } else {
        // All methods failed
        console.error('All PDF display methods failed');
        setIsLoading(false);
        setLoadError('Unable to display PDF. Please try downloading it instead.');
        if (onError) onError();
      }
    }
  };

  // Open document in new tab
  const handleOpenInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      toast.success('Document opened in new tab');
    }
  };

  // Download document
  const handleDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = title || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  // Retry loading with direct mode
  const handleRetry = () => {
    setViewerMode('direct');
    setLoadError(null);
    setIsLoading(true);
    setRetryCount(0);
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
                {viewerMode === 'direct' ? 'Standard view...' : 
                 viewerMode === 'iframe' ? 'Alternative view...' : 
                 'Google Docs view...'}
              </p>
            )}
          </div>
        </div>
      )}

      {viewerMode === 'direct' && (
        <object
          ref={objectRef}
          data={effectiveUrl || ''}
          type="application/pdf"
          className="w-full h-full"
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
        >
          <p className="p-4">Your browser cannot display this PDF</p>
        </object>
      )}

      {viewerMode === 'iframe' && (
        <iframe
          ref={iframeRef}
          src={effectiveUrl || ''}
          className="w-full h-full border-0"
          title={`Document Preview: ${title}`}
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          sandbox="allow-same-origin allow-scripts allow-forms"
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      )}

      {viewerMode === 'google' && (
        <iframe
          src={googleDocsUrl}
          className="w-full h-full border-0"
          title={`Google Docs Viewer: ${title}`}
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      )}
    </div>
  );
};

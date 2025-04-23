
import React, { useState, useEffect, useRef } from 'react';
import { ViewerLoadingState } from '@/components/DocumentViewer/components/ViewerLoadingState';
import { AlertTriangle, Download, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDocumentURL } from '@/hooks/useDocumentURL';

interface SimplePDFViewerProps {
  storagePath: string | null;
  title?: string;
  className?: string;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({
  storagePath,
  title = 'Document',
  className = ''
}) => {
  // State for handling different view modes
  const [viewMode, setViewMode] = useState<'direct' | 'iframe' | 'google' | 'error'>('direct');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const objectRef = useRef<HTMLObjectElement>(null);
  
  // Use our enhanced hook to get the document URL
  const { url, isLoading, error, retry, refreshUrl } = useDocumentURL(storagePath);

  // Reset view mode when URL changes
  useEffect(() => {
    if (url) {
      setViewMode('direct');
    }
  }, [url]);

  // Notify on errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to retrieve document URL', { description: error });
    }
  }, [error]);

  // Construct Google Docs viewer URL if needed
  const googleDocsUrl = url 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` 
    : '';

  // Handle successful document load
  const handleLoadSuccess = () => {
    console.log(`Document loaded successfully in ${viewMode} mode`);
  };

  // Handle document load errors with fallback strategy
  const handleLoadError = () => {
    console.error(`Failed to load document in ${viewMode} mode`);
    
    // Try next viewing mode if current one fails
    if (viewMode === 'direct') {
      console.log('Switching to iframe mode');
      setViewMode('iframe');
      setLoadAttempt(prev => prev + 1);
    } else if (viewMode === 'iframe') {
      console.log('Switching to Google Docs viewer mode');
      setViewMode('google');
      setLoadAttempt(prev => prev + 1);
    } else {
      // All viewing modes failed
      setViewMode('error');
      toast.error('Unable to display document');
    }
  };

  // Handle manual retry
  const handleRetry = () => {
    setViewMode('direct');
    setLoadAttempt(0);
    retry();
  };

  // Handle opening document in new tab
  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
      toast.success('Document opened in new tab');
    } else {
      toast.error('Unable to open document');
    }
  };

  // Handle document download
  const handleDownload = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = title || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } else {
      toast.error('Unable to download document');
    }
  };

  // Render error state
  if (viewMode === 'error' || error) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted/30 ${className}`}>
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Document Viewer Error</h3>
          <p className="text-muted-foreground mb-6">{error || 'Unable to display document'}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            {url && (
              <>
                <Button variant="outline" onClick={handleOpenInNewTab} className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <ViewerLoadingState
        message="Loading document..." 
        size="medium"
        onRetry={handleRetry}
      />
    );
  }

  // If we have no URL
  if (!url) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted/30 ${className}`}>
        <p className="text-muted-foreground">No document URL available</p>
      </div>
    );
  }

  // Render document based on current viewing mode
  return (
    <div className={`relative w-full h-full ${className}`}>
      {viewMode === 'direct' && (
        <object
          ref={objectRef}
          data={url}
          type="application/pdf"
          className="w-full h-full"
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
        >
          <p>Your browser doesn't support PDF embedding. Trying alternative viewer...</p>
        </object>
      )}

      {viewMode === 'iframe' && (
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
          title={`Document: ${title}`}
          sandbox="allow-same-origin allow-scripts allow-forms"
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      )}

      {viewMode === 'google' && (
        <iframe
          src={googleDocsUrl}
          className="w-full h-full border-0"
          onLoad={handleLoadSuccess}
          onError={() => setViewMode('error')}
          title={`Google Docs Viewer: ${title}`}
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      )}

      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity bg-black/10 p-2 rounded">
        <Button 
          variant="secondary" 
          size="sm" 
          className="mr-2"
          onClick={handleOpenInNewTab}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Open
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDownload}
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
};

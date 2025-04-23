
import React, { useState, useEffect } from 'react';
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
  const [viewMode, setViewMode] = useState<'direct' | 'google' | 'iframe'>('direct');
  const [displayError, setDisplayError] = useState<string | null>(null);
  const { url, isLoading, error, retry } = useDocumentURL(storagePath);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // Reset error state when URL changes
  useEffect(() => {
    setDisplayError(null);
  }, [url]);

  // Show toast when there's an URL retrieval error
  useEffect(() => {
    if (error) {
      toast.error('Failed to retrieve document URL');
      setDisplayError(error);
    }
  }, [error]);

  // Construct Google Docs viewer URL
  const googleDocsUrl = url 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` 
    : '';

  const handleLoadSuccess = () => {
    console.log('Document loaded successfully in mode:', viewMode);
  };

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
      setDisplayError('Unable to display document. Please try downloading it instead.');
    }
  };

  const handleRetry = () => {
    setDisplayError(null);
    setViewMode('direct');
    setLoadAttempt(0);
    retry();
  };

  const handleOpenInNewTab = () => {
    if (url) {
      window.open(url, '_blank');
      toast.success('Document opened in new tab');
    } else {
      toast.error('Unable to open document');
    }
  };

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
  if (displayError) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted/30 ${className}`}>
        <div className="text-center max-w-md p-6">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Document Viewer Error</h3>
          <p className="text-muted-foreground mb-6">{displayError}</p>
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

  // If we have URL but no viewing mode has been successful yet
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
          data={url}
          type="application/pdf"
          className="w-full h-full"
          onLoad={handleLoadSuccess}
          onError={handleLoadError}
        >
          <p>Your browser doesn't support PDF embedding</p>
        </object>
      )}

      {viewMode === 'iframe' && (
        <iframe
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
          onError={handleLoadError}
          title={`Google Docs Viewer: ${title}`}
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      )}

      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
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

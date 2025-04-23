
import React from 'react';
import { FileText, FileX, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDocumentURL } from '@/hooks/useDocumentURL';
import { ViewerLoadingState } from '@/components/DocumentViewer/components/ViewerLoadingState';

interface SimpleFilePreviewProps {
  storagePath: string | null;
  title: string;
  onOpenFull?: () => void;
  className?: string;
}

export const SimpleFilePreview: React.FC<SimpleFilePreviewProps> = ({
  storagePath,
  title,
  onOpenFull,
  className = ''
}) => {
  const { url, isLoading, error, retry } = useDocumentURL(storagePath);
  const isPdf = storagePath?.toLowerCase().endsWith('.pdf');

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

  if (isLoading) {
    return (
      <ViewerLoadingState 
        message="Loading preview..." 
        size="small" 
      />
    );
  }

  if (error || !url) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-muted/30 rounded-md ${className}`}>
        <FileX className="h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="font-medium text-center mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground text-center mb-4">
          {error || "Unable to load document preview"}
        </p>
        <Button 
          variant="default" 
          size="sm" 
          onClick={onOpenFull}
          className="mb-2"
        >
          Open in Document Viewer
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => retry()}
        >
          Retry Loading
        </Button>
      </div>
    );
  }

  // For PDF files, we can show a small preview
  if (isPdf) {
    return (
      <div className={`relative ${className}`}>
        <object
          data={url}
          type="application/pdf"
          className="w-full h-full rounded-md"
        >
          <p>Your browser doesn't support PDF embedding</p>
        </object>
        
        <div className="absolute top-2 right-2 bg-black/10 p-1 rounded">
          <Button 
            variant="secondary" 
            size="sm" 
            className="mr-2"
            onClick={onOpenFull}
          >
            Open Full
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
  }

  // For other files, show a file card
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-muted/30 rounded-md ${className}`}>
      <FileText className="h-12 w-12 text-primary/60 mb-3" />
      <h3 className="font-medium text-center mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground text-center mb-4">
        Click to view this document
      </p>
      <Button 
        variant="default" 
        onClick={onOpenFull}
        className="mb-2"
      >
        Open in Document Viewer
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
  );
};


import { useRef, useState, useEffect } from "react";
import { AlertTriangle, FileText, Download } from "lucide-react";
import logger from "@/utils/logger";
import { Button } from "@/components/ui/button";

interface DocumentObjectProps {
  publicUrl: string;
  onError?: () => void;
}

export const DocumentObject: React.FC<DocumentObjectProps> = ({ 
  publicUrl, 
  onError 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  
  // Function to handle iframe load errors
  const handleError = () => {
    logger.error(`Error loading document in iframe (attempt ${loadAttempts + 1})`);
    
    if (loadAttempts < 2) {
      // Try one more time with a cache-busting URL
      setLoadAttempts(prev => prev + 1);
    } else {
      setLoadError("The document couldn't be displayed. It may be in an unsupported format or inaccessible.");
      if (onError) onError();
    }
  };

  // Try to reload on attempt change
  useEffect(() => {
    if (loadAttempts > 0 && iframeRef.current) {
      const iframe = iframeRef.current;
      // Force iframe refresh with timestamp
      const timestamp = Date.now();
      iframe.src = `${publicUrl}?t=${timestamp}`;
    }
  }, [loadAttempts, publicUrl]);

  // Cache-bust the URL to ensure fresh content
  const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
  
  // Function to handle direct download
  const handleDownload = async () => {
    try {
      window.open(publicUrl, '_blank');
    } catch (error) {
      logger.error('Download error:', error);
      setLoadError("Failed to download the document. Please try again later.");
    }
  };

  return (
    <div className="relative w-full rounded-md overflow-hidden border">
      {loadError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 z-10">
          <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-md max-w-md text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-sm font-medium">{loadError}</p>
            <div className="flex justify-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download Document
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      
      <iframe
        ref={iframeRef}
        className="w-full h-[70vh] border-0"
        title="Document Preview"
        src={cacheBustedUrl}
        onError={handleError}
      />
    </div>
  );
};

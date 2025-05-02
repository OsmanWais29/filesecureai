
import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";
import { DocumentViewerFrameProps } from "../types";

export const DocumentViewerFrame: React.FC<DocumentViewerFrameProps> = ({
  fileUrl,
  title,
  isLoading,
  useDirectLink,
  zoomLevel,
  isPdfFile,
  isDocFile,
  onIframeLoad,
  onIframeError,
  iframeRef,
  forceReload,
  onOpenInNewTab,
  onDownload
}) => {
  const googleDocsViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`;

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
        <div className="text-center">
          <LoadingSpinner size="large" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document preview...</p>
        </div>
      </div>
    );
  }

  // For PDF files, try using the object tag first with fallback to iframe
  if (useDirectLink && isPdfFile) {
    return (
      <object
        data={fileUrl}
        type="application/pdf"
        className="w-full h-full"
        onLoad={onIframeLoad}
        onError={(e) => {
          console.error("PDF object load error, falling back to Google Docs viewer");
          onIframeError();
        }}
      >
        <iframe 
          src={googleDocsViewerUrl}
          className="w-full h-full border-0"
          onLoad={onIframeLoad}
          onError={onIframeError}
          referrerPolicy="no-referrer"
          allow="fullscreen"
        />
      </object>
    );
  }

  if ((useDirectLink && isDocFile) || isDocFile) {
    return (
      <iframe 
        src={googleDocsViewerUrl}
        className="w-full h-full border-0"
        onLoad={onIframeLoad}
        onError={onIframeError}
        referrerPolicy="no-referrer"
        allow="fullscreen"
      />
    );
  }

  if (useDirectLink && !isPdfFile && !isDocFile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30">
        <div className="text-center max-w-md p-6">
          <p className="text-muted-foreground mb-4">
            Browser security settings are preventing the document from being displayed inline.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={onOpenInNewTab} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Document in New Tab
            </Button>
            <Button variant="outline" onClick={onDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Document
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe 
      ref={iframeRef}
      src={`${fileUrl}?t=${forceReload}`}
      className="w-full h-full border-0"
      title={`Document Preview: ${title}`}
      sandbox="allow-same-origin allow-scripts allow-forms"
      style={{transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top'}}
      onLoad={onIframeLoad}
      onError={onIframeError}
      referrerPolicy="no-referrer"
      allow="fullscreen"
    />
  );
};


import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { DocumentPreviewContentProps } from '../hooks/types';
import { PDFViewer } from '../PDFViewer';
import { ExcelViewer } from '../ExcelViewer';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const DocumentPreviewContent: React.FC<DocumentPreviewContentProps> = ({ 
  storagePath, 
  documentId, 
  title,
  previewState 
}) => {
  const {
    fileUrl,
    fileExists,
    isExcelFile,
    previewError,
    isLoading,
    networkStatus,
    handleFullRecovery,
    isPdfFile,
    isDocFile,
    isImageFile,
    useDirectLink,
    zoomLevel,
    onZoomIn,
    onZoomOut,
    onOpenInNewTab,
    onDownload,
    onPrint,
    iframeRef
  } = previewState;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center">
          <LoadingSpinner size="large" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document preview...</p>
        </div>
      </div>
    );
  }

  if (!fileExists) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Document Not Found</h3>
          <p className="text-muted-foreground mb-6">
            The document could not be found or accessed. It may have been moved or deleted.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleFullRecovery} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Document</h3>
          <p className="text-muted-foreground mb-6">{previewError}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleFullRecovery} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Connection Status: {networkStatus}
          </p>
        </div>
      </div>
    );
  }

  // Render based on file type
  if (isExcelFile) {
    return (
      <ExcelViewer 
        url={fileUrl || ''} 
        title={title || 'Excel Document'}
      />
    );
  }

  if (isPdfFile && isPdfFile()) {
    return (
      <PDFViewer
        fileUrl={fileUrl}
        title={title}
        zoomLevel={zoomLevel || 100}
        onLoad={() => console.log("PDF loaded successfully")}
        onError={() => console.error("PDF load failed")}
      />
    );
  }

  // Fallback for other document types
  return (
    <div className="h-full w-full relative">
      {fileUrl && (
        <iframe
          ref={iframeRef}
          src={fileUrl}
          title={title || "Document Preview"}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms"
          onError={() => console.error("Error loading document")}
        />
      )}
    </div>
  );
};

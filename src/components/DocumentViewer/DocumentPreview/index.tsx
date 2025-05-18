
import React, { useEffect } from 'react';
import { usePreviewState } from './hooks/usePreviewState';
import { DocumentPreviewContent } from './components/DocumentPreviewContent';
import { startJwtMonitoring, stopJwtMonitoring } from "@/utils/jwtMonitoring";

interface DocumentPreviewProps {
  storagePath: string;
  documentId?: string;
  title?: string;
  onAnalysisComplete?: () => void;
  bypassAnalysis?: boolean;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  storagePath,
  documentId,
  title,
  onAnalysisComplete,
  bypassAnalysis = false
}) => {
  const previewState = usePreviewState(documentId || '', storagePath);

  // Start JWT monitoring for better token management
  useEffect(() => {
    startJwtMonitoring();
    
    return () => {
      stopJwtMonitoring();
    };
  }, []);

  return (
    <DocumentPreviewContent
      storagePath={storagePath}
      documentId={documentId}
      title={title}
      previewState={previewState}
    />
  );
};

export default DocumentPreview;

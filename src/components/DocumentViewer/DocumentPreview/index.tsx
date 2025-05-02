
import React, { useEffect } from 'react';
import usePreviewState from './hooks/usePreviewState';
import DocumentPreviewContent from './DocumentPreviewContent';
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
  const previewState = usePreviewState(
    storagePath,
    documentId,
    title,
    onAnalysisComplete,
    bypassAnalysis
  );

  // Start JWT monitoring for better token management
  useEffect(() => {
    startJwtMonitoring();
    
    return () => {
      stopJwtMonitoring();
    };
  }, []);

  return (
    <DocumentPreviewContent
      {...previewState}
    />
  );
};

export default DocumentPreview;

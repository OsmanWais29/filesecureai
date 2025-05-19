
import React from 'react';
import { usePreviewState } from './hooks/usePreviewState';
import { DocumentPreviewContent } from './components/DocumentPreviewContent';
import { PreviewStateProps } from './hooks/usePreviewState/types';

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
  const previewState = usePreviewState({
    documentId: documentId || '',
    storagePath,
    onAnalysisComplete,
    bypassAnalysis
  });

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


import React, { useState, useEffect } from 'react';
import { useDocumentViewer } from '../hooks/useDocumentViewer';
import { ViewerLoadingState } from '../components/ViewerLoadingState';
import { ViewerErrorState } from '../components/ViewerErrorState';
import { ViewerNotFoundState } from '../components/ViewerNotFoundState';
import { ThreePanelLayout } from './ThreePanelLayout';

interface ProfessionalDocumentViewerProps {
  documentId: string;
  onLoadFailure?: () => void;
}

export const ProfessionalDocumentViewer: React.FC<ProfessionalDocumentViewerProps> = ({
  documentId,
  onLoadFailure
}) => {
  const { document, loading, loadingError, handleRefresh, isNetworkError } = useDocumentViewer(documentId);

  useEffect(() => {
    if (loadingError && onLoadFailure) {
      onLoadFailure();
    }
  }, [loadingError, onLoadFailure]);

  if (loading) {
    return <ViewerLoadingState onRetry={handleRefresh} networkError={isNetworkError} />;
  }

  if (loadingError) {
    return <ViewerErrorState error={loadingError} onRetry={handleRefresh} />;
  }

  if (!document) {
    return <ViewerNotFoundState />;
  }

  return (
    <div className="h-full overflow-hidden bg-background">
      <ThreePanelLayout 
        document={document}
        documentId={documentId}
      />
    </div>
  );
};

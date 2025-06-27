
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useDocumentViewer } from '../hooks/useDocumentViewer';
import { ViewerLoadingState } from '../components/ViewerLoadingState';
import { ViewerErrorState } from '../components/ViewerErrorState';
import { ViewerNotFoundState } from '../components/ViewerNotFoundState';
import { ThreePanelLayout } from './ThreePanelLayout';
import { toast } from 'sonner';

interface ComprehensiveDocumentViewerProps {
  documentId: string;
  onLoadFailure?: () => void;
}

export const ComprehensiveDocumentViewer: React.FC<ComprehensiveDocumentViewerProps> = ({
  documentId,
  onLoadFailure
}) => {
  const { document, loading, loadingError, handleRefresh, isNetworkError } = useDocumentViewer(documentId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState(1);
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    if (loadingError && onLoadFailure) {
      console.log("Document load failed, calling onLoadFailure callback");
      onLoadFailure();
    }
  }, [loadingError, onLoadFailure]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
    console.log('Searching for:', query);
  };

  const handleAddAnnotation = (annotation: any) => {
    setAnnotations(prev => [...prev, annotation]);
    toast.success('Annotation added successfully');
  };

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
        searchQuery={searchQuery}
        onSearch={handleSearch}
        selectedPage={selectedPage}
        onPageSelect={setSelectedPage}
        annotations={annotations}
        onAddAnnotation={handleAddAnnotation}
      />
    </div>
  );
};

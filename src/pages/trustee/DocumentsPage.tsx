
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DocumentManagement } from '@/components/DocumentList/DocumentManagement';

const TrusteeDocumentsPage = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <DocumentManagement />
      </div>
    </ErrorBoundary>
  );
};

export default TrusteeDocumentsPage;

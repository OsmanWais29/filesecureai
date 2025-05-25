
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentManagement } from '@/components/DocumentList/DocumentManagement';

const DocumentsPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6 bg-background min-h-screen">
        <DocumentManagement />
      </div>
    </MainLayout>
  );
};

export default DocumentsPage;

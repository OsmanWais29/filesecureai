
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentManagement } from '@/components/DocumentList/DocumentManagement';

const DocumentsPage = () => {
  return (
    <MainLayout>
      <DocumentManagement />
    </MainLayout>
  );
};

export default DocumentsPage;

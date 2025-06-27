
import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfessionalDocumentViewer } from '@/components/DocumentViewer/ProfessionalDocumentViewer';

const DocumentViewerPage = () => {
  const { documentId } = useParams<{ documentId: string }>();

  if (!documentId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
            <p className="text-muted-foreground">No document ID provided in the URL.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)]">
        <ProfessionalDocumentViewer 
          documentId={documentId}
          onLoadFailure={() => {
            console.log("Document failed to load:", documentId);
          }}
        />
      </div>
    </MainLayout>
  );
};

export default DocumentViewerPage;

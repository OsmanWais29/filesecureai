
import React from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';

const DocumentViewerPage = () => {
  const { documentId } = useParams();

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Document Viewer</h1>
          <p className="text-gray-600 mt-1">Viewing document: {documentId}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Document viewer for document ID: {documentId}</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentViewerPage;

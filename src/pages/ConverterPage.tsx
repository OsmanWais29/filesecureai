
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentConverter } from '@/components/converter/DocumentConverter';

const ConverterPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Document Converter</h1>
          <p className="text-gray-600 mt-1">Convert PDF documents to structured XML format for analysis.</p>
        </div>
        <DocumentConverter />
      </div>
    </MainLayout>
  );
};

export default ConverterPage;

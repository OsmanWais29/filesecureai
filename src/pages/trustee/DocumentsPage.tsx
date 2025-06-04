
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DocumentManagement } from "@/components/DocumentList/DocumentManagement";

const TrusteeDocumentsPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-1">Upload, analyze, and manage bankruptcy forms and documents.</p>
        </div>
        <DocumentManagement />
      </div>
    </MainLayout>
  );
};

export default TrusteeDocumentsPage;

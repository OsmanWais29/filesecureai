
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DocumentViewerPage as MainDocumentViewerPage } from "@/pages/DocumentViewerPage";

const TrusteeDocumentViewerPage = () => {
  return (
    <MainLayout>
      <MainDocumentViewerPage />
    </MainLayout>
  );
};

export default TrusteeDocumentViewerPage;

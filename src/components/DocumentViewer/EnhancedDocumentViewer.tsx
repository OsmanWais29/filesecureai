
import React, { useState, useEffect } from "react";
import DocumentPreview from "./DocumentPreview";
import { useDocumentDetails } from "./hooks/useDocumentDetails";

interface EnhancedDocumentViewerProps {
  documentId: string;
  documentTitle?: string;
}

export const EnhancedDocumentViewer: React.FC<EnhancedDocumentViewerProps> = ({
  documentId,
  documentTitle
}) => {
  const { document, isLoading, error, fetchDocumentDetails } = useDocumentDetails(documentId);
  
  useEffect(() => {
    // Fetch document details on component mount
    fetchDocumentDetails();
  }, [documentId]);
  
  if (isLoading) {
    return <div>Loading document details...</div>;
  }
  
  if (error || !document) {
    return <div>Error loading document details: {error || "Document not found"}</div>;
  }
  
  return (
    <DocumentPreview 
      storagePath={document.storage_path}
      documentId={documentId}
      title={documentTitle || document.title}
    />
  );
};

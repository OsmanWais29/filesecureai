
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClientViewer } from "@/components/client/ClientViewer";

const ClientViewerPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/documents');
  };

  const handleDocumentOpen = (documentId: string) => {
    navigate(`/document-viewer/${documentId}`);
  };

  if (!clientId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Client Not Found</h1>
          <p className="text-gray-600 mb-4">The requested client could not be found.</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <ClientViewer 
      clientId={clientId}
      onBack={handleBack}
      onDocumentOpen={handleDocumentOpen}
    />
  );
};

export default ClientViewerPage;

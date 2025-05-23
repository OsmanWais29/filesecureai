
import React from "react";
import { ClientInfoPanel } from "../ClientInfo";
import { DocumentGrid } from "../DocumentGrid";
import { FilePreview } from "../FilePreview";
import { Client, Document } from "../../types";

interface MobileTabletViewProps {
  client: Client;
  documents: Document[];
  selectedDocumentId: string;
  onClientUpdate: (updatedClient: Client) => void;
  onDocumentSelect: (documentId: string) => void;
  onDocumentOpen: (documentId: string) => void;
}

export const MobileTabletView: React.FC<MobileTabletViewProps> = ({
  client,
  documents,
  selectedDocumentId,
  onClientUpdate,
  onDocumentSelect,
  onDocumentOpen,
}) => {
  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  return (
    <div className="flex flex-col h-full">
      {/* Client Info Panel - Compact for mobile */}
      <div className="flex-shrink-0 border-b">
        <ClientInfoPanel
          client={client}
          tasks={[]} // Add empty tasks array
          documentCount={documents.length} // Add document count
          lastActivityDate={client.last_activity || new Date().toISOString()} // Add last activity date
          documents={documents}
          onClientUpdate={onClientUpdate}
          onDocumentSelect={onDocumentSelect}
          selectedDocumentId={selectedDocumentId}
        />
      </div>

      {/* Documents Section */}
      <div className="flex-1 p-4 overflow-auto">
        {selectedDocument ? (
          <FilePreview 
            document={selectedDocument}
            onDocumentOpen={onDocumentOpen}
          />
        ) : (
          <DocumentGrid 
            documents={documents}
            onDocumentSelect={onDocumentSelect}
            selectedDocumentId={selectedDocumentId}
          />
        )}
      </div>
    </div>
  );
};

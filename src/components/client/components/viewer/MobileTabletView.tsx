
import React from "react";
import { ClientInfoPanel } from "../ClientInfo";
import { DocumentGrid } from "../../../DocumentList/components/DocumentGrid";
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
          tasks={[]}
          documentCount={documents.length}
          lastActivityDate={client.last_activity || new Date().toISOString()}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map(doc => (
              <div 
                key={doc.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => onDocumentSelect(doc.id)}
              >
                <h3 className="font-medium">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.type}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

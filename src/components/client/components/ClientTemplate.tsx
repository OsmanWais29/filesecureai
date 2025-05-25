
import React, { useState, useEffect } from "react";
import { ClientHeader } from "./viewer/ClientHeader";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ClientInfoPanel } from "./ClientInfo/ClientInfoPanel";
import { ClientDocumentsPanel } from "./ClientDocumentsPanel";
import { FilePreviewPanel } from "./FilePreview/FilePreviewPanel";
import { Client, Document } from "../types";
import { toast } from "sonner";
import { getClientData } from "../data/clientInfoTemplates";
import { getClientDocuments } from "../data/clientDocumentTemplates";
import { getClientTasks } from "../data/clientTaskTemplates";

interface ClientTemplateProps {
  clientId: string;
  onBack: () => void;
  onDocumentOpen?: (documentId: string) => void;
}

export const ClientTemplate = ({ clientId, onBack, onDocumentOpen }: ClientTemplateProps) => {
  console.log("ClientTemplate: Initializing with client ID:", clientId);
  
  const [client, setClient] = useState<Client>(getClientData(clientId));
  const [documents, setDocuments] = useState<Document[]>(getClientDocuments(clientId));
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  
  // Load client data based on clientId
  useEffect(() => {
    const clientData = getClientData(clientId);
    setClient(clientData);
    
    const clientDocuments = getClientDocuments(clientId);
    setDocuments(clientDocuments);
    
    toast.success(`${clientData.name}'s profile loaded`, {
      description: "Client data retrieved successfully"
    });
  }, [clientId]);
  
  const handleClientUpdate = (updatedClient: Client) => {
    console.log("ClientTemplate: Client update received:", updatedClient);
    setClient(updatedClient);
    toast.success("Client information updated", {
      description: "Your changes have been saved"
    });
  };
  
  const handleDocumentSelect = (documentId: string) => {
    console.log("Selected document:", documentId);
    const doc = documents.find(d => d.id === documentId);
    setSelectedDocument(doc || null);
    setSelectedDocumentId(documentId);
  };
  
  const handleDocumentOpen = (documentId: string) => {
    console.log("ClientTemplate: Document open requested:", documentId);
    if (onDocumentOpen) {
      console.log("ClientTemplate: Using provided onDocumentOpen callback");
      onDocumentOpen(documentId);
    } else {
      console.log("ClientTemplate: No document open callback provided, showing toast only");
      toast.info("Opening document", {
        description: `Opening ${documents.find(d => d.id === documentId)?.title || 'document'}`
      });
    }
  };

  // Get tasks for this client
  const tasks = getClientTasks(clientId);

  return (
    <div className="h-screen flex flex-col">
      <ClientHeader client={client} onBack={onBack} />
      
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel: Client Information */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <div className="h-full border-r bg-muted/20">
              <ClientInfoPanel 
                client={client} 
                tasks={tasks}
                documentCount={documents.length}
                lastActivityDate={client.last_interaction}
                documents={documents}
                onDocumentSelect={handleDocumentSelect}
                selectedDocumentId={selectedDocumentId}
                onClientUpdate={handleClientUpdate}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Middle Panel: Documents */}
          <ResizablePanel defaultSize={45} minSize={30} maxSize={60}>
            <div className="h-full border-r">
              <ClientDocumentsPanel
                documents={documents.map(doc => ({
                  id: doc.id,
                  title: doc.title,
                  type: doc.type || 'document',
                  status: 'complete' as const,
                  category: doc.type === 'financial' ? 'Financial' : doc.type === 'form' ? 'Forms' : 'Other',
                  dateModified: doc.updated_at,
                  fileType: 'pdf',
                  fileSize: '2.3 MB'
                }))}
                onDocumentSelect={handleDocumentSelect}
                selectedDocumentId={selectedDocumentId}
              />
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right Panel: File Preview */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
            <div className="h-full">
              <FilePreviewPanel 
                document={selectedDocument} 
                onDocumentOpen={handleDocumentOpen}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ClientTemplate;

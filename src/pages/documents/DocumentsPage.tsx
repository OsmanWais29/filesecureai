
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDocumentsPage } from "./hooks/useDocumentsPage";
import { ClientList } from "@/components/documents/ClientList";
import { DocumentTree } from "@/components/documents/DocumentTree";

const DocumentsPage = () => {
  const {
    filteredDocuments,
    clients,
    handleClientSelect
  } = useDocumentsPage();

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        {/* Left Panel: Client List */}
        <div className="w-72 flex-shrink-0 bg-background border-r border-border">
          <ClientList 
            clients={clients}
            onClientSelect={handleClientSelect}
          />
        </div>
        
        {/* Right Panel: Document Tree */}
        <div className="flex-1 p-4 bg-background">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Select a client to view their documents and folders
            </p>
          </div>
          
          <div className="border border-border rounded-lg shadow-sm overflow-hidden bg-card h-[calc(100%-5rem)]">
            <DocumentTree 
              rootNodes={filteredDocuments}
              onNodeSelect={(node) => console.log('Selected node:', node)}
              onFileOpen={(node) => console.log('Opening file:', node)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentsPage;

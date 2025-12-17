
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDocumentsPage } from "./hooks/useDocumentsPage";
import { ClientList } from "@/components/documents/ClientList";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { EditDocumentDialog } from "@/components/documents/EditDocumentDialog";
import { DocumentReorderDialog } from "@/components/documents/DocumentReorderDialog";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { Button } from "@/components/ui/button";
import { FolderPlus, Upload } from "lucide-react";
import { CreateFolderDialog } from "@/components/documents/CreateFolderDialog";
import { UploadDocumentDialog } from "@/components/documents/UploadDocumentDialog";

const DocumentsPage = () => {
  const {
    filteredDocuments,
    clients,
    selectedClient,
    handleClientSelect
  } = useDocumentsPage();

  const {
    isLoading,
    handleEdit,
    handleMerge,
    handleDelete,
    handleRecover,
    handleReorder
  } = useDocumentActions();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadDocumentOpen, setUploadDocumentOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<{id: string, name: string} | null>(null);

  // Get all documents for reordering
  const allDocuments = filteredDocuments.flatMap(node => {
    const docs: any[] = [];
    const traverse = (n: any) => {
      if (n.type === 'file') {
        docs.push({ id: n.id, title: n.name, type: n.folderType });
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    traverse(node);
    return docs;
  });

  const handleEditDocument = async (documentId: string, newName: string) => {
    await handleEdit(documentId, newName);
  };

  const handleMergeDocuments = async (documentIds: string[]) => {
    await handleMerge(documentIds);
  };

  const handleDeleteDocuments = async (documentIds: string[]) => {
    await handleDelete(documentIds);
  };

  const handleRecoverDocuments = async (documentIds: string[]) => {
    await handleRecover(documentIds);
  };

  const handleOpenReorder = () => {
    setReorderDialogOpen(true);
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        {/* Left Panel: Client List */}
        <div className="w-72 flex-shrink-0 bg-background border-r border-border">
          <ClientList 
            clients={clients}
            selectedClientId={selectedClient}
            onClientSelect={handleClientSelect}
          />
        </div>
        
        {/* Right Panel: Document Tree */}
        <div className="flex-1 flex flex-col bg-background">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Documents</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedClient 
                    ? `Viewing documents for ${selectedClientData?.name}` 
                    : "Select a client to view their documents and folders"}
                </p>
              </div>
              {selectedClient && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateFolderOpen(true)}
                  >
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setUploadDocumentOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Document Tree */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="border border-border rounded-lg shadow-sm overflow-hidden bg-card h-full">
              <DocumentTree 
                rootNodes={filteredDocuments}
                selectedClientId={selectedClient}
                selectedClientName={selectedClientData?.name}
                onNodeSelect={(node) => {
                  console.log("Selected node:", node);
                }}
                onFileOpen={(node) => console.log('Opening file:', node)}
                onEdit={handleEditDocument}
                onMerge={handleMergeDocuments}
                onDelete={handleDeleteDocuments}
                onRecover={handleRecoverDocuments}
                onCreateFolder={() => setCreateFolderOpen(true)}
                onUploadDocument={() => setUploadDocumentOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Documents Dialog */}
      <DocumentReorderDialog
        open={reorderDialogOpen}
        onOpenChange={setReorderDialogOpen}
        documents={allDocuments}
        onReorder={handleReorder}
      />

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        clientId={selectedClient}
        clientName={selectedClientData?.name}
      />

      {/* Upload Document Dialog */}
      <UploadDocumentDialog
        open={uploadDocumentOpen}
        onOpenChange={setUploadDocumentOpen}
        clientId={selectedClient}
        clientName={selectedClientData?.name}
      />
    </MainLayout>
  );
};

export default DocumentsPage;

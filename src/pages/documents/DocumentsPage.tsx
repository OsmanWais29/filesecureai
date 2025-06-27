
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDocumentsPage } from "./hooks/useDocumentsPage";
import { ClientList } from "@/components/documents/ClientList";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { DocumentActionBar } from "@/components/documents/DocumentActionBar";
import { EditDocumentDialog } from "@/components/documents/EditDocumentDialog";
import { DocumentReorderDialog } from "@/components/documents/DocumentReorderDialog";
import { useDocumentActions } from "@/hooks/useDocumentActions";

const DocumentsPage = () => {
  const {
    filteredDocuments,
    clients,
    selectedClient,
    handleClientSelect
  } = useDocumentsPage();

  const {
    isLoading,
    selectedDocuments,
    setSelectedDocuments,
    handleEdit,
    handleMerge,
    handleDelete,
    handleRecover,
    handleReorder
  } = useDocumentActions();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
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

  const handleEditDocument = (documentId: string) => {
    const doc = allDocuments.find(d => d.id === documentId);
    if (doc) {
      setEditingDocument({ id: documentId, name: doc.title });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEdit = async (newName: string) => {
    if (editingDocument) {
      await handleEdit(editingDocument.id, newName);
      setEditingDocument(null);
    }
  };

  const handleOpenReorder = () => {
    setReorderDialogOpen(true);
  };

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
        
        {/* Right Panel: Document Tree with Actions */}
        <div className="flex-1 flex flex-col bg-background">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground">
              {selectedClient 
                ? `Viewing documents for ${clients.find(c => c.id === selectedClient)?.name}` 
                : "Select a client to view their documents and folders"}
            </p>
          </div>

          {/* Document Action Bar */}
          <DocumentActionBar
            selectedDocuments={selectedDocuments}
            onEdit={handleEditDocument}
            onMerge={handleMerge}
            onDelete={handleDelete}
            onRecover={handleRecover}
            onReorder={handleOpenReorder}
            disabled={isLoading}
          />
          
          {/* Document Tree */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="border border-border rounded-lg shadow-sm overflow-hidden bg-card h-full">
              <DocumentTree 
                rootNodes={filteredDocuments}
                onNodeSelect={(node) => {
                  if (node.type === 'file') {
                    const isSelected = selectedDocuments.includes(node.id);
                    if (isSelected) {
                      setSelectedDocuments(prev => prev.filter(id => id !== node.id));
                    } else {
                      setSelectedDocuments(prev => [...prev, node.id]);
                    }
                  }
                }}
                onFileOpen={(node) => console.log('Opening file:', node)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Document Dialog */}
      <EditDocumentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        documentName={editingDocument?.name || ''}
        onSave={handleSaveEdit}
      />

      {/* Reorder Documents Dialog */}
      <DocumentReorderDialog
        open={reorderDialogOpen}
        onOpenChange={setReorderDialogOpen}
        documents={allDocuments}
        onReorder={handleReorder}
      />
    </MainLayout>
  );
};

export default DocumentsPage;

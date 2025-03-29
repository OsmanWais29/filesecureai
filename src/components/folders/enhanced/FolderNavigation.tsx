
import { useState } from "react";
import { FolderStructure } from "@/types/folders";
import { Document } from "@/components/client/types";
import { useFolderDragDrop } from "./hooks/useFolderDragDrop";
import { useFolderExpansion } from "./hooks/useFolderExpansion";
import { ClientSidebar } from "./components/ClientSidebar";
import { DocumentTree } from "./components/DocumentTree";
import { 
  extractClientsFromDocuments,
  filterDocumentsByClient,
  filterFoldersByClient
} from "./hooks/utils/clientExtractionUtils";

interface FolderNavigationProps {
  folders: FolderStructure[];
  documents: Document[];
  onFolderSelect: (folderId: string) => void;
  onDocumentSelect: (documentId: string) => void;
  onDocumentOpen: (documentId: string) => void;
  onClientSelect?: (clientId: string) => void;
  onClientViewerAccess?: (clientId: string) => void;
  selectedFolderId?: string;
  selectedClientId?: string;
  expandedFolders: Record<string, boolean>;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function FolderNavigation({
  folders,
  documents,
  onFolderSelect,
  onDocumentSelect,
  onDocumentOpen,
  onClientSelect,
  onClientViewerAccess,
  selectedFolderId,
  selectedClientId,
  expandedFolders,
  setExpandedFolders
}: FolderNavigationProps) {
  // Get drag and drop functionality from hook
  const {
    dragOverFolder,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setExpandedFoldersFunction
  } = useFolderDragDrop(documents);
  
  // Get folder expansion functionality from hook
  const { toggleFolder, form47Documents } = useFolderExpansion(
    folders,
    documents,
    expandedFolders,
    setExpandedFolders
  );
  
  // Provide the setExpandedFolders function to the drag-drop hook
  setExpandedFoldersFunction(setExpandedFolders);
  
  // Extract unique clients from documents using our utility function
  const clients = extractClientsFromDocuments(documents);

  // Filter documents based on selected client using our utility function
  const filteredDocuments = filterDocumentsByClient(documents, selectedClientId || null);

  // Filter folders based on selected client using our utility function
  const filteredFolders = filterFoldersByClient(folders, filteredDocuments, selectedClientId || null);

  return (
    <div className="flex h-full">
      {/* Client Sidebar */}
      {clients.length > 0 && onClientSelect && onClientViewerAccess && (
        <ClientSidebar
          clients={clients}
          onClientSelect={onClientSelect}
          onClientViewerAccess={onClientViewerAccess}
          selectedClientId={selectedClientId}
        />
      )}
      
      {/* Document Tree */}
      <div className="flex-1">
        <DocumentTree
          filteredFolders={filteredFolders}
          filteredDocuments={filteredDocuments}
          form47Documents={form47Documents}
          selectedFolderId={selectedFolderId}
          selectedClientId={selectedClientId}
          expandedFolders={expandedFolders}
          dragOverFolder={dragOverFolder}
          onFolderSelect={onFolderSelect}
          onDocumentSelect={onDocumentSelect}
          onDocumentOpen={onDocumentOpen}
          toggleFolder={toggleFolder}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragLeave={handleDragLeave}
          handleDrop={handleDrop}
        />
      </div>
    </div>
  );
}

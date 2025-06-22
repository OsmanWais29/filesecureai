
import React, { useState } from 'react';
import { FolderNavigation } from './FolderNavigation';
import { useCreateFolderStructure } from './hooks/useCreateFolderStructure';
import { createDocumentHierarchy } from './utils/documentUtils';
import { convertToClientDocument } from '@/utils/typeGuards';
import { Document as DocumentListDocument } from '@/components/DocumentList/types';
import { Document } from '@/types/client';

interface EnhancedFolderTabProps {
  documents: DocumentListDocument[];
  onDocumentOpen: (documentId: string) => void;
  onRefresh?: () => void;
}

export const EnhancedFolderTab = ({
  documents,
  onDocumentOpen,
  onRefresh
}: EnhancedFolderTabProps) => {
  // Convert DocumentList documents to client documents
  const convertedDocuments: Document[] = documents.map(doc => convertToClientDocument(doc));
  
  // Setup hierarchy for the document tree
  const processedDocuments = createDocumentHierarchy(convertedDocuments);
  const { folders } = useCreateFolderStructure(processedDocuments);
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>();
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Pre-expand folders for better visibility on first load
  React.useEffect(() => {
    if (Object.keys(expandedFolders).length === 0 && folders.length > 0) {
      // Start with client folders expanded
      const initialExpandedState: Record<string, boolean> = {};
      
      folders.forEach(folder => {
        if (folder.type === 'client') {
          initialExpandedState[folder.id] = true;
          
          // Also expand first level of child folders
          folder.children?.forEach(childFolder => {
            initialExpandedState[childFolder.id] = true;
          });
        }
      });
      
      setExpandedFolders(initialExpandedState);
    }
  }, [folders, expandedFolders]);

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);

    // If this is a client folder, set the selected client
    const selectedFolder = folders.find(f => f.id === folderId);
    if (selectedFolder?.type === 'client') {
      setSelectedClientId(folderId);
    }
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  return (
    <div className="p-4 enhanced-folder-tab">
      <FolderNavigation
        folders={folders}
        documents={processedDocuments}
        onFolderSelect={handleFolderSelect}
        onDocumentSelect={handleDocumentSelect}
        onDocumentOpen={onDocumentOpen}
        selectedFolderId={selectedFolderId}
        selectedClientId={selectedClientId}
        expandedFolders={expandedFolders}
        setExpandedFolders={setExpandedFolders}
      />
    </div>
  );
};


import { useEffect, useState } from "react";
import { useDocuments } from "@/components/DocumentList/hooks/useDocuments";
import { useCreateFolderStructure } from "@/components/folders/enhanced/hooks/useCreateFolderStructure";
import { useFolderNavigation } from "./useFolderNavigation";
import { convertDocumentArray } from "@/utils/typeGuards";

interface Client {
  id: string;
  name: string;
  status?: string;
  location?: string;
  lastActivity?: string;
}

export const useDocumentsPage = () => {
  const { documents, refetch, isLoading } = useDocuments();
  const safeDocuments = convertDocumentArray(documents || []);
  const { folders } = useCreateFolderStructure(safeDocuments);
  
  const [clients, setClients] = useState<Client[]>([]);
  
  const handleClientSelect = (clientId: string) => {
    console.log("Selected client:", clientId);
  };
  
  const {
    selectedItemId,
    selectedItemType,
    folderPath,
    handleItemSelect: originalHandleItemSelect,
    handleOpenDocument
  } = useFolderNavigation(safeDocuments);
  
  const handleItemSelect = (id: string, type: "folder" | "file") => {
    originalHandleItemSelect(id, type);
  };

  useEffect(() => {
    if (safeDocuments && safeDocuments.length > 0) {
      const uniqueClients = Array.from(
        new Set(
          safeDocuments
            .filter(doc => doc.metadata && (doc.metadata as any).client_id)
            .map(doc => (doc.metadata as any).client_id)
        )
      ).map(clientId => {
        const doc = safeDocuments.find(d => (d.metadata as any).client_id === clientId);
        const metadata = doc?.metadata as any || {};
        
        return {
          id: clientId,
          name: metadata.client_name || `Client ${clientId}`,
          status: metadata.status || "Active",
          location: metadata.location || metadata.province || null,
          lastActivity: doc?.updated_at || null
        };
      });

      if (!uniqueClients.some(c => c.id === 'josh-hart')) {
        uniqueClients.push({
          id: 'josh-hart',
          name: 'Josh Hart',
          status: 'Active',
          location: 'Ontario',
          lastActivity: new Date().toISOString()
        });
      }

      setClients(uniqueClients);
    }
  }, [safeDocuments]);

  return {
    documents: safeDocuments,
    refetch,
    isLoading,
    folders,
    selectedItemId,
    selectedItemType,
    folderPath,
    clients,
    handleItemSelect,
    handleOpenDocument,
    handleClientSelect
  };
};

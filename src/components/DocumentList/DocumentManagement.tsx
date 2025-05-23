
import { useState, useEffect, useMemo } from "react";
import { useDocumentsWithSearch } from "./hooks/useDocumentsWithSearch";
import { cn } from "@/lib/utils";
import { Toolbar } from "./components/Toolbar";
import { Sidebar } from "./components/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UncategorizedDocuments } from "./components/UncategorizedDocuments";
import { DocumentGrid } from "./components/DocumentGrid";
import PreviewDialog from "./components/PreviewDialog";
import { Document } from "./types";

interface DocumentManagementProps {
  onDocumentSelect?: (id: string) => void;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({ onDocumentSelect }) => {
  const { documents, isLoading, searchQuery, setSearchQuery } = useDocumentsWithSearch();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<{ id: string; title: string; storage_path: string } | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Update the document grid whenever sidebar state changes
  useEffect(() => {
    // Force a small delay to let transitions complete
    const resizeTimer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    return () => clearTimeout(resizeTimer);
  }, [isSidebarCollapsed]);

  // Emit document sidebar collapse event to update other components
  useEffect(() => {
    const event = new CustomEvent('documentSidebarCollapse', { 
      detail: { collapsed: isSidebarCollapsed } 
    });
    window.dispatchEvent(event);

    // Set CSS variable for document sidebar width
    document.documentElement.style.setProperty(
      '--document-sidebar-width',
      isSidebarCollapsed ? '4rem' : '16rem'
    );
    
    document.documentElement.style.setProperty(
      '--document-sidebar-collapsed-width',
      '4rem'
    );
    
    return () => {
      document.documentElement.style.removeProperty('--document-sidebar-width');
      document.documentElement.style.removeProperty('--document-sidebar-collapsed-width');
    };
  }, [isSidebarCollapsed]);

  // Filter documents based on search, folder, and type
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = !searchQuery || 
        (doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (doc.metadata && doc.metadata.client_name?.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesFolder = !selectedFolder ? true : 
        selectedFolder === 'Uncategorized' 
          ? !doc.parent_folder_id && (!doc.metadata || !doc.metadata.client_name)
          : (doc.metadata && doc.metadata.client_name === selectedFolder) || doc.parent_folder_id === selectedFolder;
      
      const matchesType = !filterType || doc.type === filterType;

      return matchesSearch && matchesFolder && matchesType;
    });
  }, [documents, searchQuery, selectedFolder, filterType]);

  // Group documents by client
  const groupedByClient = useMemo(() => {
    return filteredDocuments.reduce((acc, doc) => {
      let clientName = 'Uncategorized';
      
      if (doc.metadata && doc.metadata.client_name) {
        clientName = doc.metadata.client_name;
      } else if (doc.parent_folder_id) {
        const parentDoc = documents.find(d => d.id === doc.parent_folder_id);
        if (parentDoc && parentDoc.metadata && parentDoc.metadata.client_name) {
          clientName = parentDoc.metadata.client_name;
        }
      }

      if (!acc[clientName]) {
        acc[clientName] = {
          documents: [],
          lastUpdated: null as Date | null,
          types: new Set<string>()
        };
      }
      
      acc[clientName].documents.push(doc);
      acc[clientName].types.add(doc.type || 'Other');
      
      // Use optional chaining and nullish coalescing to handle optional properties
      const updatedAt = doc.updated_at ? new Date(doc.updated_at) : new Date();
      if (!acc[clientName].lastUpdated || updatedAt > acc[clientName].lastUpdated!) {
        acc[clientName].lastUpdated = updatedAt;
      }
      
      return acc;
    }, {} as Record<string, { 
      documents: Document[], 
      lastUpdated: Date | null,
      types: Set<string>
    }>);
  }, [filteredDocuments, documents]);

  const handleDocumentClick = (document: { id: string; title: string; storage_path: string }) => {
    setPreviewDocument(document);
  };

  const renderContent = () => {
    if (selectedFolder === 'Uncategorized') {
      const uncategorizedDocs = filteredDocuments.filter(
        doc => !doc.parent_folder_id && (!doc.metadata || !doc.metadata.client_name)
      );
      
      return (
        <UncategorizedDocuments 
          documents={uncategorizedDocs}
          onDocumentClick={handleDocumentClick}
        />
      );
    }

    return (
      <DocumentGrid
        isGridView={isGridView}
        groupedByClient={groupedByClient}
        selectedFolder={selectedFolder}
        onFolderSelect={setSelectedFolder}
        onDocumentClick={handleDocumentClick}
      />
    );
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] transition-all duration-300">
      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        groupedByClient={groupedByClient}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
      />

      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        isSidebarCollapsed 
          ? "document-content-with-collapsed-sidebar" 
          : "document-content-with-sidebar"
      )}>
        <div className="p-4 md:p-6 space-y-6">
          <Toolbar
            selectedFolder={selectedFolder}
            isGridView={isGridView}
            setIsGridView={setIsGridView}
            onFilterChange={setFilterType}
            currentFilter={filterType}
          />

          <ScrollArea className="h-[calc(100vh-12rem)]">
            {isLoading ? (
              <div className={cn(
                "grid gap-4",
                isGridView ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
              )}>
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i}
                    className="h-[200px] rounded-lg border bg-card animate-pulse"
                  />
                ))}
              </div>
            ) : renderContent()}
          </ScrollArea>
        </div>
      </main>

      <PreviewDialog
        document={previewDocument}
        onClose={() => setPreviewDocument(null)}
        onAnalysisComplete={(id) => {
          if (onDocumentSelect) {
            onDocumentSelect(id);
          }
        }}
      />
    </div>
  );
};

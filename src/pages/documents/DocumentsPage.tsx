
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ClientList } from "@/components/documents/ClientList";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { useDocumentsData } from "../../hooks/useDocumentsData";
import { MainLayout } from "@/components/layout/MainLayout";

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const { clients, documents, filteredDocuments } = useDocumentsData(selectedClient);
  
  useEffect(() => {
    toast.success("Documents loaded", {
      description: "Document tree is now visible"
    });
  }, []);
  
  const handleNodeSelect = (node: any) => {
    console.log("Selected node:", node);
  };

  const handleClientSelect = (clientId: string) => {
    console.log("DocumentsPage: Selected client:", clientId);
    setSelectedClient(clientId);
    // Navigate to the client viewer page
    navigate(`/client-viewer/${clientId}`);
  };

  const handleFileOpen = (node: any) => {
    console.log("Opening file:", node);
    
    if (node?.type === "file") {
      // Check for Form 47 or Consumer Proposal files
      const lowerName = (node.name || "").toLowerCase();
      if (
        lowerName.includes("form 47") ||
        lowerName.includes("consumer proposal") ||
        node.id === "form47-file"
      ) {
        navigate("/document-viewer/form47");
        return;
      }
      
      // General fallback for other documents
      if (node.id) {
        navigate(`/document-viewer/${node.id}`);
      }
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Panel: Client List */}
        <div className="w-72 flex-shrink-0">
          <ClientList 
            clients={clients}
            selectedClientId={selectedClient}
            onClientSelect={handleClientSelect}
          />
        </div>
        
        {/* Right Panel: Document Tree */}
        <div className="flex-1 border-l p-4">
          <h2 className="text-xl font-semibold mb-4">
            {selectedClient 
              ? `${clients.find(c => c.id === selectedClient)?.name}'s Documents` 
              : "All Documents"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedClient 
              ? "Client-specific documents and folders" 
              : "System-wide view of all document activity. Click a client on the left to view their dedicated page."}
          </p>
          
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <DocumentTree 
              rootNodes={filteredDocuments}
              onNodeSelect={handleNodeSelect}
              onFileOpen={handleFileOpen}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentsPage;

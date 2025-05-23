
import { useState } from "react";
import { Client, Document, Task } from "../../types";
import { ClientInfoPanel } from "../ClientInfo";
import { DocumentsPanel } from "../DocumentsPanel";
import { ClientActivityLog } from "../ClientActivityLog";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientTabContentProps {
  client: Client;
  documents: Document[];
  activeTab: string;
  onDocumentOpen: (documentId: string) => void;
  onClientUpdate?: (updatedClient: Client) => void;
}

export const ClientTabContent = ({ 
  client, 
  documents, 
  activeTab,
  onDocumentOpen,
  onClientUpdate
}: ClientTabContentProps) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  
  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };
  
  const handleDocumentOpen = (documentId: string) => {
    // Call the passed onDocumentOpen prop
    onDocumentOpen(documentId);
  };
  
  // Calculate last activity date from documents
  const getLastActivityDate = () => {
    if (client.last_interaction) return client.last_interaction;
    
    if (documents.length === 0) return undefined;
    
    return documents.reduce((latest, doc) => {
      const docDate = new Date(doc.updated_at);
      return !latest || docDate > new Date(latest) ? doc.updated_at : latest;
    }, "");
  };

  // Mock tasks for the client if none are available
  const mockTasks: Task[] = [
    {
      id: "task-1",
      title: "Review client information",
      dueDate: new Date().toISOString(),
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system'
    },
    {
      id: "task-2",
      title: "Schedule follow-up meeting",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'pending',
      priority: 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system'
    }
  ];

  // If we don't have client data yet, show a skeleton loader for better UX
  if (!client || !client.id) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-[200px] mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <Skeleton className="h-5 w-[120px] mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
          <Card className="p-4">
            <Skeleton className="h-5 w-[150px] mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      {activeTab === "info" && (
        <ClientInfoPanel 
          client={client}
          tasks={mockTasks}
          documentCount={documents.length}
          lastActivityDate={getLastActivityDate()}
          documents={documents}
          onDocumentSelect={handleDocumentSelect}
          selectedDocumentId={selectedDocumentId}
          onClientUpdate={onClientUpdate}
        />
      )}
      
      {activeTab === "documents" && (
        <DocumentsPanel 
          documents={documents}
          activeTab="all"
          setActiveTab={() => {}}
          onDocumentSelect={handleDocumentSelect}
          onDocumentOpen={handleDocumentOpen}
          selectedDocumentId={selectedDocumentId}
        />
      )}
      
      {activeTab === "activity" && (
        <ClientActivityLog 
          client={client}
          documents={documents}
        />
      )}
    </div>
  );
};


import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ClientInfoPanel } from "../ClientInfo";
import { DocumentsPanel } from "../DocumentsPanel";
import { FilePreviewPanel } from "../FilePreview/FilePreviewPanel";
import { Client, Document, Task } from "../../types";

interface DesktopViewProps {
  client: Client;
  documents: Document[];
  selectedDocument: Document | null;
  selectedDocumentId: string | null;
  activeTab: string;
  setActiveTab: (value: string) => void;
  onDocumentOpen: (documentId: string) => void;
  onDocumentSelect: (documentId: string) => void;
  lastActivityDate?: string;
}

export const DesktopView = ({
  client,
  documents,
  selectedDocument,
  selectedDocumentId,
  activeTab,
  setActiveTab,
  onDocumentOpen,
  onDocumentSelect,
  lastActivityDate,
}: DesktopViewProps) => {
  // Mock tasks for the client
  const mockTasks: Task[] = [
    {
      id: "task-1",
      title: "Review client documents",
      dueDate: new Date().toISOString(),
      status: 'pending',
      priority: 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system'
    },
    {
      id: "task-2",
      title: "Follow up on deadlines",
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'pending',
      priority: 'high',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'system'
    }
  ];

  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-12rem)] rounded-lg border">
      <ResizablePanel defaultSize={20} minSize={15} className="bg-muted/30">
        <ClientInfoPanel 
          client={client} 
          tasks={mockTasks}
          documentCount={documents.length}
          lastActivityDate={lastActivityDate}
          documents={documents}
          onDocumentSelect={onDocumentSelect}
          selectedDocumentId={selectedDocumentId}
          onClientUpdate={(updatedClient) => console.log("Client updated:", updatedClient)}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50}>
        <DocumentsPanel
          documents={documents}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onDocumentOpen={onDocumentOpen}
          onDocumentSelect={onDocumentSelect}
          selectedDocumentId={selectedDocumentId}
        />
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={30} minSize={20}>
        <FilePreviewPanel 
          document={selectedDocument} 
          onDocumentOpen={onDocumentOpen}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

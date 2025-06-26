
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientDocumentUpload } from "./ClientDocumentUpload";
import { ClientDocumentTree } from "./ClientDocumentTree";
import { ClientDocumentsTab } from "./ClientDocumentsTab";

interface ClientDocumentsManagerProps {
  clientId: string;
  clientName: string;
}

export const ClientDocumentsManager = ({ clientId, clientName }: ClientDocumentsManagerProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = () => {
    // Refresh the document tree when upload completes
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="structure">Document Tree</TabsTrigger>
          <TabsTrigger value="manage">Manage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-6">
          <ClientDocumentUpload 
            clientId={clientId}
            clientName={clientName}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>
        
        <TabsContent value="structure" className="mt-6">
          <ClientDocumentTree 
            key={refreshKey}
            clientId={clientId}
            clientName={clientName}
          />
        </TabsContent>
        
        <TabsContent value="manage" className="mt-6">
          <ClientDocumentsTab 
            client={{ id: clientId, name: clientName, email: '' }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

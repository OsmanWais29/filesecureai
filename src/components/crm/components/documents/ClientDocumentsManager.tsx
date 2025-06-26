
import { useState } from "react";
import { ClientDocumentUpload } from "./ClientDocumentUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ClientDocumentsManagerProps {
  clientId: string;
  clientName: string;
}

export const ClientDocumentsManager = ({ clientId, clientName }: ClientDocumentsManagerProps) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleViewDocuments = () => {
    navigate('/documents');
  };

  return (
    <div className="space-y-6">
      <ClientDocumentUpload 
        clientId={clientId}
        clientName={clientName}
        onUploadComplete={handleUploadComplete}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            View Organized Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            After uploading, documents are automatically organized by DeepSeek AI in the main Documents page.
          </p>
          <Button 
            onClick={handleViewDocuments}
            variant="outline"
            className="w-full gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Go to Documents Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

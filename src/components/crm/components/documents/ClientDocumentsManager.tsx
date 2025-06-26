
import { useState } from "react";
import { ClientDocumentUpload } from "./ClientDocumentUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, ExternalLink, ArrowRight } from "lucide-react";
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

      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="h-5 w-5 text-gray-600" />
            Organized Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            All uploaded documents are automatically organized and available in the main Documents section.
          </p>
          <Button 
            onClick={handleViewDocuments}
            variant="outline"
            className="w-full gap-2 hover:bg-white"
          >
            <span>View All Documents</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

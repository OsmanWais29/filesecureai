
import { useState } from "react";
import { ClientDocumentUpload } from "./ClientDocumentUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, ExternalLink, ArrowRight, Sparkles } from "lucide-react";
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
    <div className="space-y-8">
      {/* Upload Section */}
      <ClientDocumentUpload 
        clientId={clientId}
        clientName={clientName}
        onUploadComplete={handleUploadComplete}
      />

      {/* Navigation Card */}
      <Card className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">
                Document Organization
              </CardTitle>
              <p className="text-slate-600 text-sm mt-1">
                View all organized client documents
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white/60 rounded-lg p-4 border border-white/50">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">AI-Powered Organization</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Uploaded documents are automatically organized into client-specific folders in the main Documents section using advanced AI analysis.
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleViewDocuments}
            className="w-full h-12 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 group"
          >
            <span className="flex items-center gap-3">
              <span>View Organized Documents</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

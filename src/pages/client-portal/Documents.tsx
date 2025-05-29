
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar, AlertCircle } from "lucide-react";

interface ClientDocument {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'completed' | 'requires_signature' | 'reviewed';
  uploadDate: string;
  size: string;
  description?: string;
}

export const ClientDocuments = () => {
  const { user } = useAuthState();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    setTimeout(() => {
      setDocuments([
        {
          id: "1",
          name: "Form 47 - Consumer Proposal",
          type: "PDF",
          status: "completed",
          uploadDate: "2024-01-15",
          size: "2.4 MB",
          description: "Your consumer proposal form has been completed and submitted."
        },
        {
          id: "2",
          name: "Income Statement",
          type: "PDF",
          status: "requires_signature",
          uploadDate: "2024-01-12",
          size: "1.8 MB",
          description: "Please review and sign your income statement."
        },
        {
          id: "3",
          name: "Asset Listing",
          type: "PDF",
          status: "pending",
          uploadDate: "2024-01-10",
          size: "1.2 MB",
          description: "Asset documentation is being processed."
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'requires_signature': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
        <p className="text-gray-600 mt-2">
          View and manage your case documents and forms
        </p>
      </div>

      {documents.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents available</h3>
              <p className="text-gray-600">
                Your documents will appear here once they are uploaded by your trustee.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="bg-white/90 backdrop-blur-sm border-blue-200/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-800">{doc.name}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {doc.type} • {doc.size} • Uploaded {formatDate(doc.uploadDate)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(doc.status)} font-medium`}>
                    {doc.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {doc.description && (
                  <p className="text-gray-700">{doc.description}</p>
                )}
                
                {doc.status === 'requires_signature' && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-800 font-medium">Action Required: Signature needed</span>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;

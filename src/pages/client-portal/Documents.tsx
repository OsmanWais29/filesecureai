import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";

interface ClientDocument {
  id: string;
  title: string;
  type: string | null;
  created_at: string;
  updated_at: string;
  metadata: any;
  url: string | null;
  size: number | null;
}

export const ClientDocuments = () => {
  const { user } = useAuthState();
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_folder', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
        return;
      }
      
      // Properly type the documents data
      const typedDocuments: ClientDocument[] = (data || []).map(doc => ({
        id: doc.id as string,
        title: doc.title as string,
        type: doc.type as string | null,
        created_at: doc.created_at as string,
        updated_at: doc.updated_at as string,
        metadata: doc.metadata,
        url: doc.url as string | null,
        size: doc.size as number | null,
      }));
      
      setDocuments(typedDocuments);
    } catch (err) {
      console.error('Error in fetchDocuments:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getDocumentIcon = (type: string | null) => {
    switch (type) {
      case 'form':
        return '📋';
      case 'financial':
        return '💰';
      case 'legal':
        return '⚖️';
      default:
        return '📄';
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async (document: ClientDocument) => {
    if (!document.url) {
      toast.error('Document not available for download');
      return;
    }
    
    try {
      // In a real implementation, this would handle secure document download
      toast.info('Download started');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Documents</h1>
        <p className="text-muted-foreground">
          Access and manage your case-related documents
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="all">All Types</option>
              <option value="form">Forms</option>
              <option value="financial">Financial</option>
              <option value="legal">Legal</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Document Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-primary">{documents.length}</div>
            <div className="text-sm text-muted-foreground">Total Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {documents.filter(d => d.type === 'form').length}
            </div>
            <div className="text-sm text-muted-foreground">Forms</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-500">
              {documents.filter(d => d.type === 'financial').length}
            </div>
            <div className="text-sm text-muted-foreground">Financial</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {documents.filter(d => d.type === 'legal').length}
            </div>
            <div className="text-sm text-muted-foreground">Legal</div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your documents will appear here once uploaded by your trustee'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">{getDocumentIcon(document.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{document.title}</h3>
                        {document.type && (
                          <Badge variant="outline">
                            {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(document.created_at)}
                        </div>
                        <div>{formatFileSize(document.size)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
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

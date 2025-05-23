import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { DocumentStats } from "./DocumentStats";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentList } from "./DocumentList";
import { Button } from "@/components/ui/button";
import { FolderSync, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mergeClientFolders } from "@/utils/documents/mergeClientFolders";

interface Document {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

// Type guard to ensure proper Document type
const ensureDocumentType = (doc: unknown): Document => {
  const docObj = doc as Record<string, any>;
  return {
    id: String(docObj.id || ''),
    title: String(docObj.title || 'Untitled'),
    status: String(docObj.status || 'pending'),
    created_at: String(docObj.created_at || new Date().toISOString())
  };
};

export const DocumentVault = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clientName, setClientName] = useState("");
  const [isMerging, setIsMerging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
    subscribeToDocumentUpdates();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedDocuments = (data || []).map(ensureDocumentType);
      setDocuments(typedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch documents"
      });
    }
  };

  const subscribeToDocumentUpdates = () => {
    const channel = supabase
      .channel('document_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          console.log('Document update:', payload);
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleMergeFolders = async () => {
    if (!clientName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a client name"
      });
      return;
    }

    setIsMerging(true);
    try {
      const user = await supabase.auth.getUser();
      if (user.error) throw user.error;
      
      const success = await mergeClientFolders(clientName, user.data.user?.id || '');
      
      if (success) {
        toast({
          title: "Success",
          description: `Folders for client "${clientName}" have been merged`
        });
        setClientName("");
        fetchDocuments();
      }
    } catch (error) {
      console.error('Error merging folders:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to merge folders"
      });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Secure Document Vault</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <DocumentStats pendingCount={documents.filter(d => d.status === 'pending').length} />
            
            {/* Folder Management Tools */}
            <Card className="p-4 bg-muted/50">
              <h3 className="text-sm font-medium mb-2">Folder Management</h3>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="max-w-xs"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleMergeFolders}
                  disabled={isMerging || !clientName.trim()}
                >
                  <FolderSync className="h-4 w-4 mr-2" />
                  {isMerging ? "Merging..." : "Merge Folders"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use this tool to merge duplicate folders for the same client.
              </p>
            </Card>
            
            <DocumentUpload />
            <DocumentList documents={documents} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

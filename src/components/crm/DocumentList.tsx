
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSignature } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
interface Document {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface DocumentListProps {
  documents: Document[];
}

export const DocumentList = ({ documents }: DocumentListProps) => {
  const { toast } = useToast();

  const handleSignDocument = async (documentId: string) => {
    try {
      const { error } = await sfaiFunctions.invoke('process-document', {
        body: {
          action: 'sign',
          documentId,
          signatureData: 'electronic_signature',
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document signed successfully"
      });
    } catch (error) {
      console.error('Error signing document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign document"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Recent Documents</h4>
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileSignature className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">
                  {doc.status === 'pending' ? 'Pending signature' : 'Signed'}
                </p>
              </div>
            </div>
            {doc.status === 'pending' ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSignDocument(doc.id)}
              >
                Sign Document
              </Button>
            ) : (
              <Button variant="outline" size="sm">
                View Details
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

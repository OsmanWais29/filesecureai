
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
interface Document {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface DocumentSignaturesPanelProps {
  clientId?: string;
  clientName?: string;
  clientEmail?: string;
}

export const DocumentSignaturesPanel = ({ clientId, clientName, clientEmail }: DocumentSignaturesPanelProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [signatureType, setSignatureType] = useState<string>("electronic");
  
  // Mock documents that need signatures - in a real app, fetch these from the database
  const documents: Document[] = [
    { id: "doc1", title: "Form 47 - Consumer Proposal", status: "pending", created_at: "2024-06-01" },
    { id: "doc2", title: "Form 76 - Debt Assessment", status: "pending", created_at: "2024-05-28" },
  ];

  const handleSendForSignature = async () => {
    if (!selectedDocumentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a document to send for signature"
      });
      return;
    }

    if (!clientEmail) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Client email is required to send document for signature"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the selected document
      const document = documents.find(doc => doc.id === selectedDocumentId);
      
      // In a real implementation, this would prepare the document for signature
      // and send it to the client via the process-document edge function
      const { error } = await sfaiFunctions.invoke('process-document', {
        body: {
          action: 'prepare_signature',
          documentId: selectedDocumentId,
          clientEmail,
          clientId,
          signatureType,
          metadata: {
            documentTitle: document?.title,
            userId: clientId,
            clientName,
            formType: document?.title.includes("Form 47") ? "form-47" : 
                     document?.title.includes("Form 76") ? "form-76" : "standard"
          }
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Signature request sent to ${clientName}`
      });
      
      // In a real app, you would update the document status in the database
    } catch (error) {
      console.error('Error sending document for signature:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send signature request"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSignatureStatus = async (documentId: string) => {
    try {
      const { data, error } = await sfaiFunctions.invoke('process-document', {
        body: {
          action: 'check_signatures',
          documentId
        },
      });

      if (error) throw error;

      // Show signature status
      toast({
        title: "Signature Status",
        description: `${data.signed ? data.signed.length : 0}/${data.required ? data.required.length : 0} signatures collected`
      });
    } catch (error) {
      console.error('Error checking signature status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check signature status"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Document Signatures
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!clientId ? (
          <p className="text-muted-foreground">Select a client to manage document signatures.</p>
        ) : (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document">Select Document for Signature</Label>
                <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                  <SelectTrigger id="document">
                    <SelectValue placeholder="Select a document" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureType">Signature Type</Label>
                <Select value={signatureType} onValueChange={setSignatureType}>
                  <SelectTrigger id="signatureType">
                    <SelectValue placeholder="Select signature type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronic">Electronic Signature</SelectItem>
                    <SelectItem value="drawn">Drawn Signature</SelectItem>
                    <SelectItem value="digital">Digital Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button 
                  onClick={handleSendForSignature} 
                  disabled={!selectedDocumentId || isLoading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? "Sending..." : "Send for Signature"}
                </Button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-medium">Signature Requests</h3>
              
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-2">
                    {doc.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : doc.status === "pending" ? (
                      <Clock className="h-4 w-4 text-amber-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.status === "completed" ? "Signed" : "Awaiting signature"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => checkSignatureStatus(doc.id)}
                  >
                    Check Status
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

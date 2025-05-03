
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Signature } from "lucide-react";
import { toast } from "sonner";

interface DocuSignIntegrationProps {
  clientName: string;
  formId: string;
  onSignatureComplete: (signatureData: { name: string; date: string }) => void;
  disabled?: boolean;
}

export const DocuSignIntegration = ({
  clientName,
  formId,
  onSignatureComplete,
  disabled = false
}: DocuSignIntegrationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRequestSignature = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would connect to DocuSign API
      // For now, we'll simulate the flow
      
      toast.info("DocuSign integration demo", {
        description: "This is a simulated DocuSign flow. In a real implementation, this would redirect to DocuSign.",
        duration: 5000
      });
      
      // Simulate signing process
      setTimeout(() => {
        const signatureData = {
          name: clientName,
          date: new Date().toISOString().split('T')[0]
        };
        
        onSignatureComplete(signatureData);
        
        toast.success("Document signed successfully", {
          description: "The signature has been added to the document"
        });
        
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error with DocuSign integration:", error);
      toast.error("Failed to request signature", {
        description: "There was an error connecting to DocuSign. Please try again."
      });
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="p-4 border rounded-lg bg-blue-50">
        <h3 className="font-medium mb-2">Electronic Signature</h3>
        <p className="text-sm text-muted-foreground mb-4">
          DocuSign integration enables secure electronic signatures for your financial documents.
        </p>
        
        <Button 
          onClick={handleRequestSignature} 
          disabled={isLoading || disabled} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Signature className="h-4 w-4 mr-2" />
              Request Signature via DocuSign
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

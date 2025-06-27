
import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface DocumentObjectProps {
  url: string | null;
  isExcelFile: boolean;
  storagePath: string;
  documentId: string;
}

export const DocumentObject: React.FC<DocumentObjectProps> = ({ 
  url, 
  isExcelFile,
  storagePath,
  documentId
}) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!storagePath) {
        setLoadError("No storage path available");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .createSignedUrl(storagePath, 3600); // 1 hour expiry

        if (error) {
          console.error('Error creating signed URL:', error);
          setLoadError("Failed to generate secure document URL");
        } else {
          setSignedUrl(data.signedUrl);
        }
      } catch (error) {
        console.error('Failed to create signed URL:', error);
        setLoadError("Failed to access document");
      } finally {
        setIsLoading(false);
      }
    };

    getSignedUrl();
  }, [storagePath]);

  const handleError = () => {
    console.error('Error loading document in iframe');
    setLoadError("The document couldn't be displayed. It may be in an unsupported format or inaccessible.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (isExcelFile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="font-medium">Excel Viewer Not Available</p>
          <p className="text-sm text-muted-foreground mt-2">
            Excel files cannot be previewed directly. Please download the file to view its contents.
          </p>
        </div>
      </div>
    );
  }

  const documentUrl = signedUrl || url;

  return (
    <div className="relative w-full h-full rounded-md overflow-hidden border">
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 z-10">
          <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-md max-w-md text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto" />
            <p className="text-sm font-medium">{loadError}</p>
            <p className="text-xs text-muted-foreground">
              Try downloading the document directly if you need to view its contents.
            </p>
          </div>
        </div>
      )}
      
      {documentUrl && !loadError && (
        <iframe
          className="w-full h-full border-0"
          title="Document Preview"
          src={documentUrl}
          onError={handleError}
        />
      )}
    </div>
  );
};

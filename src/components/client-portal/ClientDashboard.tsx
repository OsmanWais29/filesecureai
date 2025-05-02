
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FileUpload } from "@/components/FileUpload";
import { useAuthState } from "@/hooks/useAuthState";

export const ClientDashboard = () => {
  const { user } = useAuthState();
  
  const handleUploadComplete = async (documentId: string) => {
    try {
      if (!user) return;
      
      // Link the document to this client's folder if needed
      console.log(`Document ${documentId} uploaded successfully`);
      
      // You could update document metadata or link to client profile here
    } catch (error) {
      console.error("Error handling uploaded document:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload and manage your documents related to your case.
            </p>
            
            <div className="mb-6">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>No documents uploaded yet. Upload your first document above.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No pending tasks at the moment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

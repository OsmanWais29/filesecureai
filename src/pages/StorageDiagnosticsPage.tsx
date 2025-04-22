
import React from "react";
import { UploadDiagnostics } from "@/components/storage/UploadDiagnostics";

const StorageDiagnosticsPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Storage Diagnostics</h1>
      <p className="text-muted-foreground mb-6">
        This page provides diagnostic tools for troubleshooting storage and upload issues, particularly related to InvalidJWT errors.
      </p>
      
      <div className="grid gap-6">
        <UploadDiagnostics />
        
        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Common JWT Issues</h2>
          
          <div className="space-y-2">
            <h3 className="font-medium">1. Token Expiration</h3>
            <p className="text-sm text-muted-foreground">
              JWT tokens typically expire after a certain time. The diagnostics will check if your token
              is expired or about to expire.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">2. Storage Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Your Supabase storage bucket may have RLS policies that are preventing uploads. The diagnostics
              will check if you have the necessary permissions.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">3. Browser Storage Issues</h3>
            <p className="text-sm text-muted-foreground">
              Sometimes browser storage (localStorage/sessionStorage) can become corrupted. The diagnostics
              will check if your storage looks valid.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">4. Network/CORS Issues</h3>
            <p className="text-sm text-muted-foreground">
              Sometimes network or CORS configuration can prevent uploads. The diagnostics will test
              both direct API calls and SDK uploads to identify the issue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDiagnosticsPage;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Check, X, AlertTriangle, FileCog } from "lucide-react";
import { runFullDiagnostics } from "@/utils/jwtDiagnostics";
import { uploadFile } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function UploadDiagnostics() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const createTestFile = () => {
    const content = `Test file created at ${new Date().toISOString()}`;
    return new File([content], "test-file.txt", { type: "text/plain" });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const testFile = createTestFile();
      toast({
        title: "Running diagnostics...",
        description: "Please wait while we analyze your JWT and storage setup."
      });

      // Run comprehensive diagnostics
      const diagnosticResults = await runFullDiagnostics(testFile);
      setResults(diagnosticResults);

      // Test upload with diagnostics
      try {
        const uploadResult = await uploadFile(
          testFile, 
          'secure_documents',
          `diagnostic-test-${Date.now()}.txt`,
          { diagnostics: true }
        );

        setResults((prev: any) => ({
          ...prev,
          uploadTest: {
            success: true,
            data: uploadResult
          }
        }));

        toast({
          title: "Test upload successful!",
          description: "The diagnostic upload worked correctly."
        });
      } catch (uploadError: any) {
        console.error("Diagnostic upload failed:", uploadError);
        setResults((prev: any) => ({
          ...prev,
          uploadTest: {
            success: false,
            error: uploadError.message || "Unknown upload error"
          }
        }));

        toast({
          variant: "destructive",
          title: "Test upload failed",
          description: uploadError.message || "Failed to upload test file"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Diagnostics failed",
        description: error.message || "An error occurred while running diagnostics"
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCog className="h-5 w-5" />
          Storage Upload Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Run diagnostics to help troubleshoot upload issues related to JWT tokens and storage permissions.
            </p>
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunning}
              className="w-full sm:w-auto"
            >
              {isRunning ? "Running..." : "Run Diagnostics"}
            </Button>
          </div>

          {results && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Diagnostic Results:</h3>
              
              <div className="space-y-2">
                {/* JWT Verification */}
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  {results.jwtVerification?.isValid ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">JWT Token Verification</p>
                    <p className="text-xs text-muted-foreground">
                      {results.jwtVerification?.isValid 
                        ? `Valid token, expires in ${Math.round(results.jwtVerification.timeRemaining / 60)} minutes` 
                        : `Invalid token: ${results.jwtVerification?.reason || "Unknown issue"}`}
                    </p>
                  </div>
                </div>

                {/* Storage Permissions */}
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  {results.storagePermissions?.canListBuckets ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Storage Permissions</p>
                    <p className="text-xs text-muted-foreground">
                      {results.storagePermissions?.canListBuckets 
                        ? `Can list buckets (${results.storagePermissions.buckets.length} found)` 
                        : "Cannot list buckets - permission issue"}
                    </p>
                    {results.storagePermissions?.canListFiles && (
                      <p className="text-xs text-muted-foreground">
                        Can list files in storage bucket
                      </p>
                    )}
                  </div>
                </div>

                {/* Browser Storage */}
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  {!results.browserStorage?.error ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Browser Storage</p>
                    <p className="text-xs text-muted-foreground">
                      {results.browserStorage?.localStorage?.count || 0} Supabase keys in localStorage, 
                      {results.browserStorage?.sessionStorage?.count || 0} in sessionStorage
                    </p>
                  </div>
                </div>

                {/* Direct Upload */}
                {results.directUpload && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    {results.directUpload?.success ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">Direct Upload Test</p>
                      <p className="text-xs text-muted-foreground">
                        {results.directUpload?.success 
                          ? "Direct API upload succeeded" 
                          : `Failed with status ${results.directUpload?.status || "unknown"}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Test */}
                {results.uploadTest && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    {results.uploadTest?.success ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">Standard Upload Test</p>
                      <p className="text-xs text-muted-foreground">
                        {results.uploadTest?.success 
                          ? "Upload succeeded using SDK" 
                          : `Failed: ${results.uploadTest?.error || "Unknown error"}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {results && (
                <div className="mt-4 p-3 border rounded-md bg-amber-50 dark:bg-amber-950/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Recommendations</h3>
                  </div>
                  <ul className="text-sm space-y-1 list-disc pl-5">
                    {!results.jwtVerification?.isValid && (
                      <li>JWT token is invalid - try signing out and back in</li>
                    )}
                    
                    {results.jwtVerification?.isValid && results.jwtVerification.timeRemaining < 300 && (
                      <li>JWT token expires soon - refresh your session</li>
                    )}
                    
                    {!results.storagePermissions?.canListBuckets && (
                      <li>Storage permission issues - check bucket policies</li>
                    )}
                    
                    {results.uploadTest?.success && !results.directUpload?.success && (
                      <li>Standard uploads work but direct API calls fail - likely a CORS issue</li>
                    )}
                    
                    {!results.uploadTest?.success && results.directUpload?.success && (
                      <li>Direct uploads work but SDK fails - could be a client SDK configuration issue</li>
                    )}
                    
                    {(!results.uploadTest?.success && !results.directUpload?.success) && (
                      <li>All upload methods fail - could be a permission issue or backend configuration</li>
                    )}
                    
                    {results.browserStorage?.localStorage?.count === 0 && (
                      <li>No Supabase tokens in localStorage - authentication might be incomplete</li>
                    )}
                    
                    <li>Check console for detailed diagnostic information</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

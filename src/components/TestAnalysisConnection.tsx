import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { triggerManualAnalysis } from "@/utils/aiRequestMonitor";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { checkAndRefreshToken } from "@/utils/jwtMonitoring";

export const TestAnalysisConnection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      // First ensure we have a fresh auth token
      const tokenStatus = await checkAndRefreshToken();
      if (!tokenStatus.isValid) {
        throw new Error(`Authentication issue: ${tokenStatus.reason || 'Unknown error'}`);
      }
      
      // Create a test document in the database
      const testText = "This is a test document for analysis. It contains example text to verify API connectivity.";
      const testFileName = `test-document-${Date.now()}.txt`;
      
      toast({
        title: "Creating test document",
        description: "Uploading test content to storage...",
      });
      
      console.log("Step 1: Uploading test file to storage");
      // Upload test document to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testFileName, new Blob([testText]), {
          contentType: 'text/plain',
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log("Step 2: File uploaded successfully, creating database record");
      toast({
        title: "Document uploaded",
        description: "Creating database record...",
      });
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Create document record in the database
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          title: 'API Connection Test Document',
          storage_path: testFileName,
          type: 'text/plain',
          size: testText.length,
          user_id: user.id,
          metadata: {
            test_document: true,
            created_at: new Date().toISOString(),
            purpose: "API connection test"
          }
        })
        .select()
        .single();
        
      if (documentError || !documentData) {
        console.error("Document creation error:", documentError);
        throw new Error(`Failed to create document record: ${documentError?.message}`);
      }
      
      console.log("Step 3: Document record created", documentData);
      toast({
        title: "Test document created",
        description: `Document ID: ${documentData.id}`,
      });
      
      // Trigger analysis on the test document
      console.log("Step 4: Triggering analysis for test document:", documentData.id);
      
      toast({
        title: "Calling Process API",
        description: "Triggering document analysis...",
      });
      
      // Call the edge function directly
      const { error: functionError, data: functionData } = await supabase.functions.invoke('process-ai-request', {
        body: {
          documentId: documentData.id,
          storagePath: testFileName,
          title: "API Connection Test Document",
          includeRegulatory: true,
          includeClientExtraction: true,
          debug: true
        }
      });
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error(`API request failed: ${functionError.message}`);
      }
      
      console.log("Step 5: Function response:", functionData);
      
      // Check the result after a moment
      toast({
        title: "Waiting for results",
        description: "Please wait while the analysis completes...",
      });
      
      // Wait 5 seconds before checking for results
      setTimeout(async () => {
        console.log("Step 6: Checking for analysis results");
        const { data: analysisData, error: analysisError } = await supabase
          .from('document_analysis')
          .select('*')
          .eq('document_id', documentData.id)
          .maybeSingle();
          
        if (analysisError) {
          console.error("Error fetching analysis:", analysisError);
          setError(`Error fetching analysis: ${analysisError.message}`);
          setIsLoading(false);
        } else if (analysisData) {
          console.log("Step 7: Analysis data found:", analysisData);
          setResponse(analysisData);
          toast({
            title: "Analysis received!",
            description: "The API connection is working correctly.",
            variant: "default" 
          });
          setIsLoading(false);
        } else {
          console.log("Step 7: No analysis data found yet, waiting longer");
          // Try once more after a longer delay
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase
              .from('document_analysis')
              .select('*')
              .eq('document_id', documentData.id)
              .maybeSingle();
              
            if (retryError) {
              setError(`Error fetching analysis: ${retryError.message}`);
            } else if (retryData) {
              setResponse(retryData);
              toast({
                title: "Analysis received (delayed)!",
                description: "The API connection is working correctly.",
                variant: "default" 
              });
            } else {
              setError("No analysis data found after extended wait. The API request may have failed.");
              toast({
                title: "No analysis data found",
                description: "The API request may have failed. Check the function logs for details.",
                variant: "destructive"
              });
            }
            setIsLoading(false);
          }, 15000); // Try again after 15 more seconds
        }
      }, 10000); // Initial wait of 10 seconds
      
    } catch (err: any) {
      console.error("Test failed:", err);
      setError(err.message || "An unknown error occurred");
      toast({
        title: "Test failed",
        description: err.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test API Connection</CardTitle>
        <CardDescription>
          This will create a test document and attempt to analyze it with the API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTestConnection} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing Connection..." : "Test API Connection"}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {response && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium text-green-800">API Connection Successful!</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">View Response Data</summary>
              <pre className="mt-2 p-2 bg-gray-50 text-xs overflow-auto max-h-60 rounded">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
        {isLoading && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
            <p className="font-medium">Testing Connection...</p>
            <p className="text-sm mt-1">
              This may take up to 30 seconds as we need to:
            </p>
            <ol className="text-sm list-decimal pl-5 mt-2 space-y-1">
              <li>Upload a test document to storage</li>
              <li>Create a database record for the document</li>
              <li>Trigger the API analysis</li>
              <li>Wait for the analysis to complete</li>
              <li>Verify the results were stored correctly</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

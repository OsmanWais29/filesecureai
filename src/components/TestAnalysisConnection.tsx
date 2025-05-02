
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { triggerManualAnalysis } from "@/utils/aiRequestMonitor";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

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
      // First create a test document in the database
      const testText = "This is a test document for analysis. It contains example text to verify API connectivity.";
      const testFileName = `test-document-${Date.now()}.txt`;
      
      toast({
        title: "Creating test document",
        description: "Uploading test content to storage...",
      });
      
      // Upload test document to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(testFileName, new Blob([testText]), {
          contentType: 'text/plain',
        });
        
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      toast({
        title: "Document uploaded",
        description: "Creating database record...",
      });
      
      // Create document record in the database
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .insert({
          title: 'API Connection Test Document',
          storage_path: testFileName,
          type: 'text/plain',
          size: testText.length,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
        
      if (documentError || !documentData) {
        throw new Error(`Failed to create document record: ${documentError?.message}`);
      }
      
      toast({
        title: "Test document created",
        description: `Document ID: ${documentData.id}`,
      });
      
      // Trigger analysis on the test document
      console.log("Triggering analysis for test document:", documentData.id);
      
      toast({
        title: "Calling DeepSeek API",
        description: "Triggering document analysis...",
      });
      
      await triggerManualAnalysis(documentData.id);
      
      // Check the result after a moment
      toast({
        title: "Waiting for results",
        description: "Please wait while the analysis completes...",
      });
      
      setTimeout(async () => {
        const { data: analysisData, error: analysisError } = await supabase
          .from('document_analysis')
          .select('*')
          .eq('document_id', documentData.id)
          .maybeSingle();
          
        if (analysisError) {
          setError(`Error fetching analysis: ${analysisError.message}`);
        } else if (analysisData) {
          setResponse(analysisData);
          toast({
            title: "Analysis received!",
            description: "The API connection is working correctly.",
            // Change from "success" to "default" as "success" is not a valid variant
            variant: "default" 
          });
        } else {
          setError("No analysis data found. The API request may have failed.");
          toast({
            title: "No analysis data found",
            description: "The API request may have failed. Check the logs for more details.",
            variant: "destructive"
          });
        }
        
        setIsLoading(false);
      }, 10000); // Wait 10 seconds for processing
      
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
          This will create a test document and attempt to analyze it with the DeepSeek API.
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
      </CardContent>
    </Card>
  );
};

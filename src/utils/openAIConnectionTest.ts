
import { useToast } from "@/hooks/use-toast";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
/**
 * Tests OpenAI connectivity and provides detailed diagnostics
 * @returns Diagnostic results including connectivity status and error details
 */
export const testOpenAIConnection = async () => {
  console.log(`Testing OpenAI connectivity`);
  
  const results = {
    success: false,
    message: "",
    timestamp: new Date().toISOString(),
    connectionEstablished: false,
    responseReceived: false,
    details: {} as Record<string, any>,
    errors: [] as string[],
    troubleshooting: {
      networkConnectivity: true,
      edgeFunctionAccess: false,
      apiKeyPresent: false,
      apiKeyValid: false,
      validResponse: false
    }
  };
  
  try {
    // First, check network connectivity
    try {
      const networkTest = await fetch('https://www.google.com');
      results.troubleshooting.networkConnectivity = networkTest.ok;
      console.log("Network connectivity test:", results.troubleshooting.networkConnectivity ? "Passed" : "Failed");
    } catch (networkErr: any) {
      results.troubleshooting.networkConnectivity = false;
      results.errors.push(`Network connectivity issue: ${networkErr.message}`);
      console.error("Network connectivity test failed:", networkErr);
    }
    
    console.log("Calling the edge function to test OpenAI connectivity");
    
    const { data, error } = await sfaiFunctions.invoke('process-ai-request', {
      body: {
        message: "Test connection",
        testMode: true,
        debug: true
      }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      results.errors.push(`Edge function error: ${error.message}`);
      results.message = `Failed to connect to edge function: ${error.message}`;
      results.troubleshooting.edgeFunctionAccess = false;
      return results;
    }
    
    console.log("Edge function response:", data);
    results.connectionEstablished = true;
    results.troubleshooting.edgeFunctionAccess = true;
    results.details.edgeFunctionResponse = data;
    
    // Check if API key is present in the edge function
    if (data?.debugInfo?.status?.openAIKeyPresent) {
      results.troubleshooting.apiKeyPresent = true;
    } else {
      results.errors.push("OpenAI API key is not configured in edge function");
      results.message = "OpenAI API key missing. Please add it to Supabase secrets.";
      return results;
    }
    
    if (data?.success) {
      results.responseReceived = true;
      results.troubleshooting.apiKeyValid = true;
      results.troubleshooting.validResponse = true;
      results.success = true;
      results.message = "Successfully connected to OpenAI via edge function";
    } else if (data?.error) {
      results.troubleshooting.apiKeyValid = false;
      results.message = data.error;
      results.errors.push(data.error);
      
      if (data.error.includes("401") || data.error.includes("invalid") || data.error.includes("authentication")) {
        results.errors.push("OpenAI API key appears to be invalid or expired");
        results.message = "Invalid or expired OpenAI API key";
      }
    }
    
    if (data?.debugInfo) {
      results.details.debugInfo = data.debugInfo;
    }
    
    return results;
    
  } catch (e: any) {
    console.error("OpenAI connection test error:", e);
    results.success = false;
    results.message = `Test failed with error: ${e.message}`;
    results.errors.push(e.message);
    return results;
  }
};

/**
 * React hook to test OpenAI connectivity with UI feedback
 */
export const useOpenAITest = () => {
  const { toast } = useToast();
  
  const runOpenAITest = async () => {
    toast({
      title: "Testing OpenAI Connection",
      description: "Please wait while we test the connection...",
      variant: "default"
    });
    
    try {
      const results = await testOpenAIConnection();
      
      if (results.success) {
        toast({
          title: "OpenAI Connection Successful",
          description: results.message,
          variant: "default",
        });
      } else {
        toast({
          title: "OpenAI Connection Failed",
          description: `${results.message}. Check the diagnostics for details.`,
          variant: "destructive",
        });
        console.error("OpenAI connection test failed:", results);
      }
      
      return results;
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: `Error running test: ${error.message}`,
        variant: "destructive",
      });
      console.error("Error in OpenAI test:", error);
      return null;
    }
  };
  
  return { runOpenAITest };
};

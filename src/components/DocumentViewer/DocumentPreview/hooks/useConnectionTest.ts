
import { useState, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';

/**
 * Hook for testing API connectivity to Supabase
 */
export function useConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  /**
   * Tests the connection to Supabase by making a simple POST request
   */
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Testing Supabase connection...");
      
      // Create a small test payload
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
      };

      // Use the document_access_history table for a simple test insertion
      // This will test both authentication and write permissions
      const { data, error } = await supabase
        .from('document_access_history')
        .insert({
          document_id: '00000000-0000-0000-0000-000000000000', // Dummy ID
          accessed_at: new Date().toISOString(),
          access_type: 'test'
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase connection test failed:", error);
        setResult({
          success: false,
          message: `Connection failed: ${error.message}`,
          details: {
            errorCode: error.code,
            errorDetails: error.details,
            hint: error.hint,
          }
        });
        toast.error("API connection test failed", { 
          description: error.message
        });
      } else {
        console.log("Supabase connection test successful:", data);
        setResult({
          success: true,
          message: "Connection successful! API keys are working.",
          details: {
            responseData: data
          }
        });
        toast.success("API connection test successful", {
          description: "Your Supabase connection is working properly."
        });
      }
    } catch (e: any) {
      console.error("Unexpected error during connection test:", e);
      setResult({
        success: false,
        message: `Unexpected error: ${e.message || "Unknown error"}`,
        details: e
      });
      toast.error("API connection test failed", { 
        description: e.message || "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    testConnection,
    isLoading,
    result
  };
}

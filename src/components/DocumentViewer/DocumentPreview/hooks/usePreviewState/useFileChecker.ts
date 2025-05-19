import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { UseFileCheckerReturn } from "../../types";

/**
 * Hook for checking file existence and accessibility in storage
 */
export const useFileChecker = ({
  setFileUrl,
  setIsLoading,
  setPreviewError,
  setHasFallbackToDirectUrl,
  setErrorDetails
}: {
  setFileUrl: (url: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setPreviewError: (error: string | null) => void;
  setHasFallbackToDirectUrl: (hasFallbackToDirectUrl: boolean) => void;
  setErrorDetails: (errorDetails: any) => void;
}): UseFileCheckerReturn => {
  
  /**
   * Handle errors that occur during file checking
   */
  const handleFileCheckError = useCallback((error: any, publicUrl?: string | null) => {
    console.error("Error checking file existence:", error);
    
    // More specific error handling
    if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
      setPreviewError(`Network error: ${navigator.onLine ? "Server connection issue" : "You appear to be offline"}`);
      
      // In case of network error but URL is already set, we'll still try to display
      if (publicUrl) {
        setFileUrl(publicUrl);
      } else {
        setFileUrl(null);
      }
    } else {
      setFileUrl(null);
      setPreviewError(`Database error: ${error.message || "Failed to check file existence"}`);
    }
    
    setErrorDetails(error);
  }, [setFileUrl, setPreviewError, setErrorDetails]);
  
  /**
   * Check if file exists in storage and get its public URL
   */
  const checkFile = useCallback(async (storagePath: string) => {
    if (!storagePath) {
      setFileUrl(null);
      setPreviewError("No storage path provided");
      return;
    }

    try {
      console.log("Checking file at path:", storagePath);
      
      // Get public URL for file with specific options to prevent caching
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);
      
      if (data?.publicUrl) {
        console.log("File found with URL:", data.publicUrl);
        
        // Set the URL regardless of fetch success
        setFileUrl(data.publicUrl);
        
        try {
          // Generate a unique URL to avoid browser caching issues
          const cacheBreakingUrl = `${data.publicUrl}?cache=${Date.now()}`;
          
          // Use a combination of fetch API and timeout to check accessibility
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(cacheBreakingUrl, { 
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal,
            // Add credentials to ensure cookies are sent with the request
            credentials: 'same-origin'
          });
          
          clearTimeout(timeoutId);
          
          console.log("File accessibility check response:", response.status);
          
          if (response.ok) {
            setPreviewError(null);
            setHasFallbackToDirectUrl(false);
          } else {
            // Status code error
            setPreviewError(`File accessibility error: HTTP ${response.status}`);
            
            // Try no-cors mode as fallback
            try {
              await fetch(data.publicUrl, { 
                method: 'HEAD',
                mode: 'no-cors' 
              });
              
              // If we get here, assume file might exist
              console.log("No-cors fetch didn't throw, assuming file exists");
              setPreviewError(null);
              setHasFallbackToDirectUrl(true);
            } catch (corsError) {
              console.error("No-cors fetch also failed:", corsError);
            }
          }
        } catch (fetchError: any) {
          console.error("Error fetching file:", fetchError);
          
          if (fetchError.name === 'AbortError') {
            setPreviewError("Request timed out. The server might be busy or the file too large.");
            // Still try to show the file
            setHasFallbackToDirectUrl(true);
          } else if (fetchError.message?.includes('network') || 
                    fetchError.message?.includes('fetch')) {
            // Network error, but we'll still try to show the file
            setPreviewError("Network issue detected. Preview might be limited.");
            setHasFallbackToDirectUrl(true);
          } else {
            // Other errors
            setPreviewError(`Error accessing file: ${fetchError.message || "Unknown error"}`);
          }
        }
      } else {
        console.error("No public URL returned for file:", storagePath);
        setFileUrl(null);
        setPreviewError("File not found in storage or not accessible");
        setHasFallbackToDirectUrl(false);
      }
    } catch (error: any) {
      // Use the error handler with the data from the current scope
      try {
        const result = await supabase.storage
          .from('documents')
          .getPublicUrl(storagePath);
          
        handleFileCheckError(error, result.data?.publicUrl);
      } catch (innerError) {
        handleFileCheckError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    setFileUrl, 
    setPreviewError, 
    setHasFallbackToDirectUrl, 
    setIsLoading, 
    handleFileCheckError
  ]);

  return {
    checkFile,
    handleFileCheckError
  };
};

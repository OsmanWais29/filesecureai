import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { startTiming, endTiming } from "@/utils/performanceMonitor";

export const useFileChecker = (
  setFileExists: (exists: boolean) => void,
  setFileUrl: (url: string | null) => void,
  setIsExcelFile: (isExcel: boolean) => void,
  setPreviewError: (error: string | null) => void,
  setNetworkStatus: (status: 'online' | 'offline') => void
) => {
  
  /**
   * Handle errors that occur during file checking
   */
  const handleFileCheckError = useCallback((error: any, publicUrl?: string | null) => {
    console.error("Error checking file existence:", error);
    
    // More specific error handling
    if (error.message && (error.message.includes('fetch') || error.message.includes('network'))) {
      setPreviewError(`Network error: ${navigator.onLine ? "Server connection issue" : "You appear to be offline"}`);
      setNetworkStatus('offline');
      
      // In case of network error but URL is already set, we'll still try to display
      if (publicUrl) {
        setFileExists(true);
        setFileUrl(publicUrl);
      } else {
        setFileExists(false);
        setFileUrl(null);
      }
    } else {
      setFileExists(false);
      setFileUrl(null);
      setPreviewError(`Database error: ${error.message || "Failed to check file existence"}`);
    }
  }, [setFileExists, setFileUrl, setPreviewError, setNetworkStatus]);
  
  /**
   * Check if file exists in storage and get its public URL
   */
  const checkFile = useCallback(async (storagePath: string) => {
    if (!storagePath) {
      setFileExists(false);
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
            setFileExists(true);
            
            // Check file type
            const isExcel = storagePath.toLowerCase().endsWith('.xlsx') || 
                           storagePath.toLowerCase().endsWith('.xls') ||
                           storagePath.toLowerCase().endsWith('.csv');
                           
            setIsExcelFile(isExcel);
            setPreviewError(null);
            setNetworkStatus('online'); // Explicitly set online status on success
          } else {
            // Status code error
            setFileExists(false);
            setPreviewError(`File accessibility error: HTTP ${response.status}`);
            
            // Try no-cors mode as fallback
            try {
              await fetch(data.publicUrl, { 
                method: 'HEAD',
                mode: 'no-cors' 
              });
              
              // If we get here, assume file might exist
              console.log("No-cors fetch didn't throw, assuming file exists");
              setFileExists(true);
              
              // Check file type
              const isExcel = storagePath.toLowerCase().endsWith('.xlsx') || 
                            storagePath.toLowerCase().endsWith('.xls') ||
                            storagePath.toLowerCase().endsWith('.csv');
                            
              setIsExcelFile(isExcel);
              setPreviewError(null);
            } catch (corsError) {
              console.error("No-cors fetch also failed:", corsError);
            }
          }
        } catch (fetchError: any) {
          console.error("Error fetching file:", fetchError);
          
          if (fetchError.name === 'AbortError') {
            setPreviewError("Request timed out. The server might be busy or the file too large.");
            // Still try to show the file
            setFileExists(true);
          } else if (fetchError.message?.includes('network') || 
                    fetchError.message?.includes('fetch')) {
            // Network error, but we'll still try to show the file
            setFileExists(true);
            setPreviewError("Network issue detected. Preview might be limited.");
            
            // Check if it's an Excel file anyway
            const isExcel = storagePath.toLowerCase().endsWith('.xlsx') || 
                          storagePath.toLowerCase().endsWith('.xls') ||
                          storagePath.toLowerCase().endsWith('.csv');
            setIsExcelFile(isExcel);
            
            // Update network status
            setNetworkStatus('offline');
          } else {
            // Other errors
            setFileExists(false);
            setPreviewError(`Error accessing file: ${fetchError.message || "Unknown error"}`);
          }
        }
      } else {
        console.error("No public URL returned for file:", storagePath);
        setFileExists(false);
        setFileUrl(null);
        setPreviewError("File not found in storage or not accessible");
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
    }
  }, [
    setFileExists, 
    setFileUrl, 
    setIsExcelFile, 
    setPreviewError, 
    setNetworkStatus, 
    handleFileCheckError
  ]);

  return {
    checkFile,
    handleFileCheckError
  };
};

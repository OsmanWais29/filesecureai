
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * A hook to fetch and manage file preview URLs from Supabase storage
 * with enhanced error handling and debugging
 */
export const useFilePreview = (storagePath: string | null) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasTriedPublicUrl, setHasTriedPublicUrl] = useState(false);
  const maxRetries = 3;
  
  // Fetch file URL with improved error handling and recovery
  const fetchFileUrl = useCallback(async (forceCacheBust = false) => {
    if (!storagePath) {
      setUrl(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    console.log(`Fetching file URL for: ${storagePath}, attempt: ${retryCount + 1}`);
    
    try {
      // Try to get a signed URL first
      const cacheBustParam = forceCacheBust ? `?t=${Date.now()}` : '';
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from("documents")
        .createSignedUrl(storagePath, 3600); // 1 hour expiration
        
      if (signedError) {
        console.warn("Signed URL error:", signedError);

        // If we haven't tried public URL yet, try that
        if (!hasTriedPublicUrl) {
          console.log("Attempting public URL fallback");
          setHasTriedPublicUrl(true);
          
          const { data: publicData } = supabase
            .storage
            .from("documents")
            .getPublicUrl(storagePath);
            
          if (publicData?.publicUrl) {
            console.log("Got public URL successfully");
            setUrl(publicData.publicUrl + cacheBustParam);
            setIsLoading(false);
            return;
          }
        }
        
        throw signedError;
      }
      
      if (signedData?.signedUrl) {
        console.log("Got signed URL successfully:", signedData.signedUrl.substring(0, 50) + "...");
        setUrl(signedData.signedUrl);
        setIsLoading(false);
        setRetryCount(0);
        return;
      }
      
      throw new Error("No URL returned from storage");
      
    } catch (err: any) {
      console.error("File preview error:", err);
      
      // Increment retry count
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // If we haven't exceeded max retries, try again with session refresh
      if (newRetryCount <= maxRetries) {
        console.log(`Retry attempt ${newRetryCount}/${maxRetries}`);
        
        // For final retry attempt, force token refresh first
        if (newRetryCount === maxRetries) {
          console.log("Final retry attempt with auth refresh");
          try {
            const { data } = await supabase.auth.refreshSession();
            if (data.session) {
              console.log("Auth session refreshed successfully");
            }
          } catch (refreshErr) {
            console.error("Auth refresh failed:", refreshErr);
          }
        }
        
        // Set a delay that increases with each retry
        const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 8000);
        setTimeout(() => fetchFileUrl(true), delay);
      } else {
        setError(err.message || "Failed to get file URL");
        setUrl(null);
        setIsLoading(false);
      }
    }
  }, [storagePath, retryCount, hasTriedPublicUrl]);
  
  // Initial fetch on component mount or when storagePath changes
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      setRetryCount(0);
      setHasTriedPublicUrl(false);
      fetchFileUrl();
    }
    
    // Set up a refresh interval for signed URLs to prevent expiry
    const refreshInterval = setInterval(() => {
      if (storagePath && url && !error) {
        console.log("Refreshing signed URL");
        fetchFileUrl();
      }
    }, 45 * 60 * 1000); // Refresh URLs every 45 minutes
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [storagePath]);
  
  // Expose a manual refresh function
  const refreshUrl = async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);
    setHasTriedPublicUrl(false);
    
    try {
      if (!storagePath) {
        throw new Error("No storage path provided");
      }
      
      // Force token refresh before getting URL
      try {
        await supabase.auth.refreshSession();
      } catch (e) {
        console.warn("Session refresh failed during manual refresh:", e);
      }
      
      // Try with force cache bust
      await fetchFileUrl(true);
      toast.success("URL refreshed successfully");
      
    } catch (err: any) {
      console.error("URL refresh error:", err);
      setError(err.message);
      setIsLoading(false);
      toast.error("Failed to refresh document URL");
    }
  };
  
  return { 
    url, 
    isLoading, 
    error,
    refreshUrl,
    retryCount,
    fetchFileUrl
  };
};

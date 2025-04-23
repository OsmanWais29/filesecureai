
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * A hook to fetch and manage file preview URLs from Supabase storage
 */
export const useFilePreview = (storagePath: string | null) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    const fetchFileUrl = async () => {
      if (!storagePath) {
        if (isMounted) {
          setUrl(null);
          setError(null);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      
      console.log(`Fetching file URL for: ${storagePath}`);
      
      try {
        // Try to get a signed URL first
        const { data: signedData, error: signedError } = await supabase
          .storage
          .from("documents")
          .createSignedUrl(storagePath, 3600); // 1 hour expiration
          
        if (signedError) {
          console.warn("Signed URL error:", signedError);
          throw signedError;
        }
        
        if (signedData?.signedUrl) {
          console.log("Got signed URL successfully");
          if (isMounted) {
            setUrl(signedData.signedUrl);
            setIsLoading(false);
          }
          return;
        }
        
        // Fall back to public URL if signed URL fails
        console.log("No signed URL returned, trying public URL");
        const { data: publicData } = supabase
          .storage
          .from("documents")
          .getPublicUrl(storagePath);
          
        if (publicData?.publicUrl) {
          console.log("Got public URL successfully");
          if (isMounted) {
            setUrl(publicData.publicUrl);
            setIsLoading(false);
          }
        } else {
          throw new Error("Unable to generate file URL");
        }
        
      } catch (err: any) {
        console.error("File preview error:", err);
        if (isMounted) {
          setError(err.message);
          setUrl(null);
          setIsLoading(false);
        }
      }
    };
    
    fetchFileUrl();
    
    // Set up a refresh interval for signed URLs to prevent expiry
    const refreshInterval = setInterval(() => {
      if (storagePath && url) {
        console.log("Refreshing signed URL");
        fetchFileUrl();
      }
    }, 45 * 60 * 1000); // Refresh URLs every 45 minutes
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [storagePath]);
  
  const refreshUrl = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!storagePath) {
        throw new Error("No storage path provided");
      }
      
      // Force token refresh before getting URL
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No authentication session");
      }
      
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from("documents")
        .createSignedUrl(storagePath, 3600);
      
      if (signedError) throw signedError;
      
      if (signedData?.signedUrl) {
        setUrl(signedData.signedUrl);
        console.log("URL refreshed successfully");
      } else {
        throw new Error("Failed to refresh URL");
      }
    } catch (err: any) {
      console.error("URL refresh error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { url, isLoading, error, refreshUrl };
};

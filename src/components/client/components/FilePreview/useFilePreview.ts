
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
    const fetchFileUrl = async () => {
      if (!storagePath) {
        setUrl(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      
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
          setUrl(signedData.signedUrl);
          return;
        }
        
        // Fall back to public URL if signed URL fails
        const { data: publicData } = supabase
          .storage
          .from("documents")
          .getPublicUrl(storagePath);
          
        if (publicData?.publicUrl) {
          setUrl(publicData.publicUrl);
        } else {
          throw new Error("Unable to generate file URL");
        }
        
      } catch (err: any) {
        console.error("File preview error:", err);
        setError(err.message);
        setUrl(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFileUrl();
    
    // Set up a refresh interval for signed URLs to prevent expiry
    const refreshInterval = setInterval(() => {
      if (storagePath && url) {
        fetchFileUrl();
      }
    }, 45 * 60 * 1000); // Refresh URLs every 45 minutes
    
    return () => clearInterval(refreshInterval);
  }, [storagePath]);
  
  return { url, isLoading, error };
};


import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Unified file preview hook for client components.
 * - Checks file existence
 * - Returns a signed URL if possible, else a public URL fallback
 * - Returns loading and error state
 */
export const useFilePreview = (storagePath: string | null) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState<boolean>(false);

  const checkFile = useCallback(async () => {
    if (!storagePath) {
      setUrl(null);
      setIsLoading(false);
      setError("No file URL provided");
      setFileExists(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const pathParts = storagePath.split("/");
      const fileName = pathParts.pop() || "";
      const folderPath = pathParts.join("/");

      // Check if file exists in folder
      const { data: fileList, error: listErr } = await supabase
        .storage
        .from("documents")
        .list(folderPath, { limit: 100, search: fileName });
      if (listErr) throw listErr;

      const exists = !!fileList?.some(f => f.name.toLowerCase() === fileName.toLowerCase());
      setFileExists(exists);
      if (!exists) {
        setError("File not found in storage");
        setUrl(null);
        setIsLoading(false);
        return;
      }

      // Attempt to get a signed URL (prefer this)
      const { data: urlData, error: urlErr } = await supabase
        .storage
        .from("documents")
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (urlData?.signedUrl) {
        setUrl(urlData.signedUrl);
        setError(null);
        setIsLoading(false);
        return;
      }
      // Fall back to public URL
      const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(storagePath);
      if (publicUrlData?.publicUrl) {
        setUrl(publicUrlData.publicUrl);
        setError(null);
      } else {
        setUrl(null);
        setError(urlErr ? urlErr.message : "Failed to get file URL");
      }
    } catch (err: any) {
      setUrl(null);
      setError(err.message || "Could not load document preview");
      setFileExists(false);
    }
    setIsLoading(false);
  }, [storagePath]);

  useEffect(() => {
    checkFile();
  }, [checkFile]);

  return { 
    url, 
    isLoading, 
    error, 
    fileExists, 
    refresh: checkFile 
  };
};

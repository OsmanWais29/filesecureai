
import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

export const useFileChecker = () => {
  const handleFileCheckError = useCallback((error: any, publicUrl?: string | null): string => {
    console.error("Error checking file existence:", error);
    return error.message || "An error occurred while checking file existence";
  }, []);

  const checkFile = useCallback(async (storagePath: string): Promise<boolean> => {
    try {
      if (!storagePath) {
        throw new Error("No storage path provided");
      }
      
      // Try to get the file metadata
      const { data, error } = await supabase
        .storage
        .from('documents')
        .list(storagePath.split('/').slice(0, -1).join('/'), {
          search: storagePath.split('/').pop()
        });
      
      if (error) {
        throw error;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("File check error:", error);
      return false;
    }
  }, []);

  return {
    checkFile,
    handleFileCheckError
  };
};

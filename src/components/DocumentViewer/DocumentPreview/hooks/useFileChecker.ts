
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UseFileCheckerProps {
  setFileUrl: (url: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setPreviewError: (error: string | null) => void;
  setHasFallbackToDirectUrl: (fallback: boolean) => void;
  setErrorDetails: (details: any) => void;
}

export const useFileChecker = ({
  setFileUrl,
  setIsLoading,
  setPreviewError,
  setHasFallbackToDirectUrl,
  setErrorDetails
}: UseFileCheckerProps) => {
  const [fileExists, setFileExists] = useState(false);
  const { toast } = useToast();

  const checkFile = async (path: string): Promise<boolean> => {
    if (!path) {
      setFileExists(false);
      return false;
    }

    try {
      // First try to get the file metadata from Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          offset: 0,
          search: path.split('/').pop()
        });

      if (error) {
        console.error("Error checking file:", error);
        setFileExists(false);
        return false;
      }

      // Check if the file exists
      const exists = data && data.length > 0 && data.some(file => 
        file.name === path.split('/').pop()
      );

      setFileExists(exists || false);

      if (exists) {
        // Get the file URL
        const { data: urlData } = await supabase.storage
          .from('documents')
          .getPublicUrl(path);

        if (urlData?.publicUrl) {
          setFileUrl(urlData.publicUrl);
        }
      }

      return exists || false;
    } catch (err) {
      console.error("Error in file check:", err);
      setFileExists(false);
      return false;
    }
  };

  const handleFileCheckError = (error: Error, publicUrl?: string | null) => {
    console.error("File check error:", error);
    setIsLoading(false);
    setPreviewError(error.message || "Error loading document");
    setErrorDetails(error);

    // If we have a public URL as a fallback, try to use it
    if (publicUrl) {
      setFileUrl(publicUrl);
      setHasFallbackToDirectUrl(true);
      toast({
        title: "Falling back to direct URL",
        description: "Using public URL as fallback method",
      });
    }
  };

  return {
    checkFile,
    handleFileCheckError,
    fileExists
  };
};

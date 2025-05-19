
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const usePreviewState = (storagePath: string) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const { toast } = useToast();

  const checkFile = useCallback(async () => {
    if (!storagePath) {
      setFileExists(false);
      setError('No storage path provided');
      setIsLoading(false);
      return false;
    }

    try {
      const { data } = await supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      if (data?.publicUrl) {
        setFileUrl(data.publicUrl);
        setFileExists(true);
        setError(null);
        
        // Determine file type from the extension
        const extension = storagePath.split('.').pop()?.toLowerCase();
        if (extension) {
          if (['pdf'].includes(extension)) {
            setFileType('pdf');
          } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            setFileType('image');
          } else if (['doc', 'docx'].includes(extension)) {
            setFileType('document');
          } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            setFileType('excel');
          } else {
            setFileType('other');
          }
        }
        return true;
      } else {
        setFileUrl(null);
        setFileExists(false);
        setError('File not found in storage');
        return false;
      }
    } catch (error: any) {
      console.error('Error checking file:', error);
      setFileUrl(null);
      setFileExists(false);
      setError(`Error: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [storagePath]);

  useEffect(() => {
    if (storagePath) {
      checkFile();
    }
  }, [storagePath, checkFile]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    return checkFile();
  }, [checkFile]);

  return {
    fileUrl,
    fileType,
    fileExists,
    isLoading,
    error,
    setError,
    refresh,
    checkFile
  };
};

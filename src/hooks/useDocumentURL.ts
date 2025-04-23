
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useDocumentURL(storagePath: string | null, bucketName: string = 'documents') {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch document URL with exponential backoff retry
  const fetchURL = useCallback(async (forceFresh: boolean = false) => {
    if (!storagePath) {
      setIsLoading(false);
      setError('No storage path provided');
      setUrl(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    console.log(`Fetching URL for document: ${storagePath} (attempt ${retryCount + 1}${forceFresh ? ', force fresh' : ''})`);
    
    try {
      // Create a cache-busting URL parameter for forced refreshes
      const cacheBuster = forceFresh ? `?t=${Date.now()}` : '';
      
      // First try to get a signed URL with long expiry
      const { data, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(`${storagePath}${cacheBuster}`, 60 * 60); // 1 hour expiry
      
      if (signedUrlError) {
        console.warn('Failed to get signed URL:', signedUrlError);
        throw signedUrlError;
      }
      
      if (data && data.signedUrl) {
        console.log('Successfully retrieved signed URL');
        setUrl(data.signedUrl);
        setIsLoading(false);
        return;
      }
      
      throw new Error('Failed to get signed URL - no URL returned');
    } catch (error) {
      // If signed URL fails, try public URL as fallback
      try {
        console.log('Falling back to public URL');
        const { data: publicData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);
        
        if (publicData && publicData.publicUrl) {
          console.log('Successfully retrieved public URL');
          setUrl(publicData.publicUrl);
          setIsLoading(false);
          return;
        }
        
        throw new Error('Failed to get public URL');
      } catch (fallbackError) {
        console.error('All URL retrieval methods failed:', fallbackError);
        setError('Failed to retrieve document URL');
        setIsLoading(false);
      }
    }
  }, [storagePath, bucketName, retryCount]);

  // Load URL when component mounts or storagePath changes
  useEffect(() => {
    if (storagePath) {
      fetchURL();
    }
  }, [storagePath, bucketName, retryCount, fetchURL]);

  // Function to manually retry URL retrieval
  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Function to force a fresh URL (bypassing cache)
  const refreshUrl = () => {
    fetchURL(true);
  };

  return { url, isLoading, error, retry, refreshUrl };
}


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useDocumentURL(storagePath: string | null, bucketName: string = 'documents') {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

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
        setRetryCount(0); // Reset retry count on success
        return;
      }
      
      throw new Error('Failed to get signed URL - no URL returned');
    } catch (error: any) {
      console.error('URL fetch error:', error);
      
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
          setRetryCount(0); // Reset retry count on success
          return;
        }
      } catch (fallbackError) {
        console.error('Public URL fallback failed:', fallbackError);
      }
      
      // If retry count not exceeded, schedule another attempt with exponential backoff
      if (retryCount < maxRetries) {
        const nextRetryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
        console.log(`Scheduling retry in ${nextRetryDelay}ms`);
        
        // Increment retry count and schedule retry
        setRetryCount(prevRetry => prevRetry + 1);
        setTimeout(() => fetchURL(true), nextRetryDelay);
      } else {
        console.error('All URL retrieval methods failed after maximum retries');
        setError('Failed to retrieve document URL after multiple attempts');
        setIsLoading(false);
      }
    }
  }, [storagePath, bucketName, retryCount, maxRetries]);

  // Load URL when component mounts or storagePath changes
  useEffect(() => {
    if (storagePath) {
      setRetryCount(0); // Reset retry count when path changes
      fetchURL();
    } else {
      setUrl(null);
      setError(null);
      setIsLoading(false);
    }
    
    return () => {
      // Cleanup if component unmounts during loading
      setUrl(null);
      setError(null);
    };
  }, [storagePath, bucketName, fetchURL]);

  // Function to manually retry URL retrieval
  const retry = useCallback(() => {
    setRetryCount(0); // Reset retry count for manual retry
    fetchURL(true); // Force fresh URL
  }, [fetchURL]);

  // Function to force a fresh URL (bypassing cache)
  const refreshUrl = useCallback(() => {
    fetchURL(true);
  }, [fetchURL]);

  return { url, isLoading, error, retry, refreshUrl };
}

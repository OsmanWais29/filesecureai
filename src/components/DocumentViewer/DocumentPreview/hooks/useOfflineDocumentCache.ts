
import { useCallback, useEffect, useState } from 'react';
import { documentCache } from './documentCache';
import { detectFileType } from './fileTypeUtils';
import { toast } from 'sonner';

interface UseOfflineDocumentCacheProps {
  url: string | null;
  storagePath: string;
  title?: string;
}

interface UseOfflineDocumentCacheReturn {
  cachedArrayBuffer: ArrayBuffer | null;
  cachedUrl: string | null;
  isCaching: boolean;
  isCached: boolean;
  isOffline: boolean;
  cacheDocument: () => Promise<boolean>;
  clearDocumentCache: () => Promise<void>;
}

/**
 * Hook for managing document caching with offline support
 */
export function useOfflineDocumentCache({
  url,
  storagePath,
  title = 'document'
}: UseOfflineDocumentCacheProps): UseOfflineDocumentCacheReturn {
  const [cachedArrayBuffer, setCachedArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const [isCaching, setIsCaching] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fileType = storagePath ? detectFileType(storagePath) : 'other';

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if the document is already cached when URL changes
  useEffect(() => {
    const checkCache = async () => {
      if (!url) return;

      try {
        const cached = await documentCache.getDocument(url);
        if (cached) {
          console.log('Document found in cache:', url);
          setCachedArrayBuffer(cached);
          
          // Create a blob URL for the cached document
          const blob = new Blob([cached], { type: getContentType(fileType) });
          const blobUrl = URL.createObjectURL(blob);
          setCachedUrl(blobUrl);
          setIsCached(true);
        } else {
          setIsCached(false);
          setCachedArrayBuffer(null);
          setCachedUrl(null);
        }
      } catch (error) {
        console.error('Error checking document cache:', error);
      }
    };

    checkCache();
  }, [url, fileType]);

  // Cache the document
  const cacheDocument = useCallback(async (): Promise<boolean> => {
    if (!url || isCaching || isCached) return false;

    try {
      setIsCaching(true);
      console.log('Caching document:', url);

      // Fetch the document
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
        },
        credentials: 'include', // Include cookies if needed for auth
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
      }

      const data = await response.arrayBuffer();
      
      // Store in cache
      await documentCache.cacheDocument(url, data, fileType);
      
      // Update state
      setCachedArrayBuffer(data);
      
      // Create a blob URL for the cached document
      const blob = new Blob([data], { type: getContentType(fileType) });
      const blobUrl = URL.createObjectURL(blob);
      setCachedUrl(blobUrl);
      setIsCached(true);
      
      console.log('Document cached successfully:', url);
      
      // Show toast in offline mode to let user know document is available offline
      if (isOffline) {
        toast.success('Document cached for offline viewing');
      }

      return true;
    } catch (error) {
      console.error('Error caching document:', error);
      return false;
    } finally {
      setIsCaching(false);
    }
  }, [url, fileType, isCaching, isCached, isOffline]);

  // Clear the document cache for this URL
  const clearDocumentCache = useCallback(async () => {
    if (!url) return;
    
    try {
      await documentCache.removeDocument(url);
      setIsCached(false);
      setCachedArrayBuffer(null);
      
      // Revoke the blob URL to free memory
      if (cachedUrl) {
        URL.revokeObjectURL(cachedUrl);
      }
      setCachedUrl(null);
      
      console.log('Document cache cleared for:', url);
    } catch (error) {
      console.error('Error clearing document cache:', error);
    }
  }, [url, cachedUrl]);

  return {
    cachedArrayBuffer,
    cachedUrl,
    isCaching,
    isCached,
    isOffline,
    cacheDocument,
    clearDocumentCache
  };
}

// Helper to determine content type based on file type
function getContentType(fileType: string): string {
  switch (fileType) {
    case 'pdf':
      return 'application/pdf';
    case 'image':
      return 'image/jpeg'; // Default, will be overridden by Blob
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'document':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}

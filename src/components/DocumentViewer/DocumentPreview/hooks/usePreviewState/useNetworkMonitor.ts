
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * A hook that monitors network connectivity to help with document loading
 */
export function useNetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
    navigator.onLine ? 'online' : 'offline'
  );

  const handleOnline = useCallback(() => {
    setNetworkStatus('online');
  }, []);

  const handleOffline = useCallback(() => {
    setNetworkStatus('offline');
  }, []);

  // Set up network event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Notify user if initially offline
    if (!navigator.onLine) {
      toast.error("You're offline. Document loading may be limited.");
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);
  
  // Active connection check
  useEffect(() => {
    // Test the connection by fetching a tiny resource
    const checkConnection = async () => {
      if (navigator.onLine) {
        try {
          // Try to fetch a tiny resource to verify connection
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          await fetch('/favicon.ico', { 
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-store'
          });
          
          clearTimeout(timeoutId);
          handleOnline();
        } catch (e) {
          // If fetch fails despite navigator.onLine being true, we might have limited connectivity
          console.warn("Network reported online but fetch failed:", e);
          // Don't set offline here as it might be a server issue, not a connection issue
        }
      }
    };
    
    checkConnection();
    
    // Setup periodic checking
    const intervalId = setInterval(checkConnection, 30000); // Check every 30s
    
    return () => {
      clearInterval(intervalId);
    };
  }, [handleOnline]);

  return {
    networkStatus,
    handleOnline,
    handleOffline
  };
}

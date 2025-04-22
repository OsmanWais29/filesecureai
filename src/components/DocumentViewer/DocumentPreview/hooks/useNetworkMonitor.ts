
import { useState, useEffect, useCallback, useRef } from 'react';

// Define NetworkStatus to include all possible values
export type NetworkStatus = 'online' | 'offline' | 'limited';

export function useNetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [isLimitedConnectivity, setIsLimitedConnectivity] = useState(false);
  const lastCheckTimeRef = useRef<number>(Date.now());
  const consecutiveFailsRef = useRef<number>(0);
  
  // Track online/offline status
  const handleOnline = useCallback(() => {
    console.log('Network status: Online');
    setNetworkStatus('online');
    // Reset consecutive failures when we're clearly online
    consecutiveFailsRef.current = 0;
  }, []);
  
  const handleOffline = useCallback(() => {
    console.log('Network status: Offline');
    setNetworkStatus('offline');
  }, []);

  // Detect limited connectivity by measuring response time with fallbacks
  const checkConnectivityQuality = useCallback(async () => {
    if (!navigator.onLine) return;
    
    // Only check if last check was more than 5 seconds ago to prevent excessive checks
    if (Date.now() - lastCheckTimeRef.current < 5000) {
      return;
    }
    
    lastCheckTimeRef.current = Date.now();
    
    // List of URLs to try in order (favicon, then a few common CDNs as fallbacks)
    const urlsToTry = [
      '/favicon.ico',
      'https://www.google.com/favicon.ico',
      'https://cdn.jsdelivr.net/favicon.ico',
    ];
    
    let succeeded = false;
    
    for (const url of urlsToTry) {
      try {
        const startTime = Date.now();
        const response = await fetch(url, { 
          method: 'HEAD',
          cache: 'no-store',
          mode: 'no-cors',
          // Short timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Successfully fetched a resource
        succeeded = true;
        
        // If response time is too high, consider it limited connectivity
        const isLimited = responseTime > 2000;
        setIsLimitedConnectivity(isLimited);
        
        if (isLimited && networkStatus === 'online') {
          console.log(`Network has limited connectivity (${responseTime}ms response time)`);
          setNetworkStatus('limited');
        } else if (!isLimited && networkStatus === 'limited') {
          console.log('Network connectivity restored to normal');
          setNetworkStatus('online');
        }
        
        // Reset consecutive failures when we succeed
        consecutiveFailsRef.current = 0;
        
        // We succeeded, so no need to try other URLs
        break;
      } catch (error) {
        // Continue to the next URL if this one failed
        console.log(`Error checking connectivity with ${url}:`, error);
      }
    }
    
    // If all URLs failed, we likely have connectivity issues
    if (!succeeded) {
      consecutiveFailsRef.current += 1;
      
      // After 3 consecutive failed attempts, consider connection limited
      if (consecutiveFailsRef.current >= 3) {
        setIsLimitedConnectivity(true);
        setNetworkStatus('limited');
        console.log('Multiple connectivity checks failed - connection appears limited');
      }
    }
  }, [networkStatus]);

  useEffect(() => {
    // Set up event listeners for online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial network status
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
    // Immediate first check
    if (navigator.onLine) {
      checkConnectivityQuality();
    }
    
    // Check connectivity quality periodically when online
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        checkConnectivityQuality();
      }
    }, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [handleOnline, handleOffline, checkConnectivityQuality]);
  
  return {
    networkStatus,
    isLimitedConnectivity,
    handleOnline,
    handleOffline,
    checkConnectivityQuality, // Expose function to allow manual checks
  };
}

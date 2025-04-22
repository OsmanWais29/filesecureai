
import { useState, useEffect, useCallback } from 'react';

// Define NetworkStatus to include all possible values
export type NetworkStatus = 'online' | 'offline' | 'limited';

export function useNetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [isLimitedConnectivity, setIsLimitedConnectivity] = useState(false);
  
  // Track online/offline status
  const handleOnline = useCallback(() => {
    console.log('Network status: Online');
    setNetworkStatus('online');
  }, []);
  
  const handleOffline = useCallback(() => {
    console.log('Network status: Offline');
    setNetworkStatus('offline');
  }, []);

  // Detect limited connectivity by measuring response time
  const checkConnectivityQuality = useCallback(async () => {
    if (!navigator.onLine) return;
    
    try {
      const startTime = Date.now();
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors'
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
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
    } catch (error) {
      console.log('Error checking connectivity:', error);
      setIsLimitedConnectivity(true);
      setNetworkStatus('limited');
    }
  }, [networkStatus]);

  useEffect(() => {
    // Set up event listeners for online/offline status
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial network status
    setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    
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
    handleOffline
  };
}

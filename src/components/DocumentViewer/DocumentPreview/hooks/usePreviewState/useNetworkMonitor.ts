
import { useState, useEffect, useCallback } from 'react';

export interface UseNetworkMonitorReturn {
  networkStatus: 'online' | 'offline' | 'limited';
  handleOnline: () => void;
  handleOffline: () => void;
  isLimitedConnectivity: boolean;
}

export const useNetworkMonitor = (): UseNetworkMonitorReturn => {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'limited'>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [isLimitedConnectivity, setIsLimitedConnectivity] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  // Handle browser online event
  const handleOnline = useCallback(() => {
    console.log('Network: 🟢 Online');
    setNetworkStatus('online');
    setConsecutiveFailures(0);
  }, []);

  // Handle browser offline event
  const handleOffline = useCallback(() => {
    console.log('Network: 🔴 Offline or limited connectivity');
    
    // Increment failures counter
    setConsecutiveFailures(prev => {
      const newCount = prev + 1;
      
      // After 3 consecutive failures, mark as having limited connectivity
      if (newCount >= 3) {
        setIsLimitedConnectivity(true);
        setNetworkStatus('limited');
      } else if (!navigator.onLine) {
        setNetworkStatus('offline');
      }
      
      return newCount;
    });
  }, []);

  // Set up event listeners for online/offline events
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    networkStatus,
    handleOnline,
    handleOffline,
    isLimitedConnectivity
  };
};

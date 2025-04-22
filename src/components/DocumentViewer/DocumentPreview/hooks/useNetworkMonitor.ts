
import { useState, useEffect } from 'react';

// Define NetworkStatus to include all possible values
export type NetworkStatus = 'online' | 'offline' | 'limited';

export function useNetworkMonitor() {
  const [status, setStatus] = useState<NetworkStatus>(
    navigator.onLine ? 'online' : 'offline'
  );

  useEffect(() => {
    const handleOnline = () => setStatus('online');
    const handleOffline = () => setStatus('offline');

    // Check connection quality
    const checkConnectionQuality = async () => {
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      try {
        const start = Date.now();
        const response = await fetch('/api/ping', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        const latency = Date.now() - start;
        
        if (!response.ok) {
          setStatus('limited');
          return;
        }
        
        // Classify connection based on latency
        setStatus(latency > 1000 ? 'limited' : 'online');
      } catch (error) {
        setStatus('limited');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkConnectionQuality();

    const intervalId = setInterval(checkConnectionQuality, 30000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  return status;
}


import { useState, useEffect } from 'react';
import logger from '@/utils/logger';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkType, setNetworkType] = useState<string | null>(null);
  
  useEffect(() => {
    const handleOnline = () => {
      logger.info('Network connection restored');
      setIsOnline(true);
    };
    
    const handleOffline = () => {
      logger.warn('Network connection lost');
      setIsOnline(false);
    };
    
    // Get connection info if available
    const getConnectionInfo = () => {
      if ('connection' in navigator) {
        // @ts-ignore - Navigator connection property exists but TypeScript doesn't know about it
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          setNetworkType(connection.effectiveType || 'unknown');
        }
      }
    };
    
    // Initial check
    getConnectionInfo();
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return {
    isOnline,
    networkType
  };
}

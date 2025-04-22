
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * An enhanced hook that monitors network connectivity to help with document loading
 * and provides additional diagnostics for troubleshooting
 */
export function useNetworkMonitor() {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'limited'>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(navigator.onLine ? new Date() : null);
  const [connectionStats, setConnectionStats] = useState<{
    downlink?: number;
    rtt?: number;
    effectiveType?: string;
    saveData?: boolean;
  }>({});

  // Track connection quality if available
  const updateConnectionQuality = useCallback(() => {
    // @ts-ignore - Connection API not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      setConnectionStats({
        downlink: connection.downlink,
        rtt: connection.rtt,
        effectiveType: connection.effectiveType,
        saveData: connection.saveData
      });
    }
  }, []);

  const handleOnline = useCallback(() => {
    setNetworkStatus('online');
    setLastOnlineTime(new Date());
    updateConnectionQuality();
    
    // Notify only if previously offline
    if (networkStatus === 'offline') {
      toast.success("You're back online. Retrying document load...");
    }
  }, [networkStatus, updateConnectionQuality]);

  const handleOffline = useCallback(() => {
    setNetworkStatus('offline');
    toast.error("You're offline. Document loading will retry when connection is restored.");
  }, []);

  // Handle limited connectivity detection
  const setLimitedConnectivity = useCallback(() => {
    if (networkStatus !== 'offline') {
      setNetworkStatus('limited');
      toast.warning("Limited connectivity detected. Document may load slowly.");
    }
  }, [networkStatus]);

  // Set up network event listeners
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Notify user if initially offline
    if (!navigator.onLine) {
      toast.error("You're offline. Document loading may be limited.");
    }
    
    // Initial connection quality check
    updateConnectionQuality();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, updateConnectionQuality]);
  
  // Advanced connection check with timeout detection
  useEffect(() => {
    // Test the connection by fetching a tiny resource
    const checkConnection = async () => {
      if (navigator.onLine) {
        try {
          // Try to fetch a tiny resource to verify connection with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const startTime = Date.now();
          await fetch('/favicon.ico', { 
            method: 'HEAD',
            signal: controller.signal,
            cache: 'no-store'
          });
          
          const responseTime = Date.now() - startTime;
          clearTimeout(timeoutId);
          
          // Detect slow connection
          if (responseTime > 2000) {
            setLimitedConnectivity();
          } else {
            handleOnline();
          }
          
          // Update connection stats
          updateConnectionQuality();
        } catch (e) {
          // If fetch fails despite navigator.onLine being true, we have limited connectivity
          console.warn("Network reported online but fetch failed:", e);
          setLimitedConnectivity();
        }
      }
    };
    
    checkConnection();
    
    // Setup periodic checking with smart interval
    const interval = setInterval(
      checkConnection, 
      networkStatus === 'limited' ? 10000 : 30000 // Check more frequently if connection is limited
    );
    
    return () => {
      clearInterval(interval);
    };
  }, [handleOnline, networkStatus, updateConnectionQuality, setLimitedConnectivity]);

  // Provide diagnostics info for troubleshooting
  const getNetworkDiagnostics = useCallback(() => {
    return {
      status: networkStatus,
      lastOnlineTime,
      navigator: {
        onLine: navigator.onLine,
        userAgent: navigator.userAgent
      },
      connection: connectionStats
    };
  }, [networkStatus, lastOnlineTime, connectionStats]);

  return {
    networkStatus,
    handleOnline,
    handleOffline,
    isLimitedConnectivity: networkStatus === 'limited',
    isFullyOnline: networkStatus === 'online',
    connectionStats,
    getNetworkDiagnostics,
    lastOnlineTime
  };
}

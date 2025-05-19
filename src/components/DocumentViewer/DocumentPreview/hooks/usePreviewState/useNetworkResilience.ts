
import { useState, useEffect, useCallback } from 'react';

export interface NetworkResilienceOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryMultiplier?: number;
}

export interface NetworkResilienceResult {
  isOnline: boolean;
  resetRetries: () => void;
  incrementRetry: () => void;
  shouldRetry: (error: Error) => boolean;
  retryCount: number;
}

const defaultOptions: NetworkResilienceOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  retryMultiplier: 1.5
};

export const useNetworkResilience = (options?: NetworkResilienceOptions): NetworkResilienceResult => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const resetRetries = useCallback(() => {
    setRetryCount(0);
  }, []);
  
  const incrementRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);
  
  const shouldRetry = useCallback((error: Error) => {
    // Check if error is network-related
    const isNetworkError = error.message?.toLowerCase().includes('network') ||
                         error.message?.toLowerCase().includes('fetch') ||
                         error.message?.toLowerCase().includes('timeout');
    
    // Only retry if we haven't exceeded maxRetries and the error is network-related
    return retryCount < (mergedOptions.maxRetries || 3) && (isNetworkError || !isOnline);
  }, [retryCount, isOnline, mergedOptions.maxRetries]);
  
  return {
    isOnline,
    resetRetries,
    incrementRetry,
    shouldRetry,
    retryCount
  };
};


import { useState, useCallback, useEffect } from 'react';
import { NetworkResilienceOptions, NetworkResilienceResult } from '../types';

export const useNetworkResilience = (
  options: NetworkResilienceOptions = {}
): NetworkResilienceResult => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryBackoffFactor = 2
  } = options;

  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastErrorTime, setLastErrorTime] = useState<number>(0);

  // Reset retry count
  const resetRetries = useCallback((): void => {
    setRetryCount(0);
  }, []);

  // Increment retry count
  const incrementRetry = useCallback((): void => {
    setRetryCount(prevCount => prevCount + 1);
    setLastErrorTime(Date.now());
  }, []);

  // Determine if we should retry
  const shouldRetry = useCallback((error: Error | { message: string }): boolean => {
    // Check if we've hit the retry limit
    if (retryCount >= maxRetries) {
      console.log(`Maximum retry count (${maxRetries}) reached, not retrying.`);
      return false;
    }

    // Check if error is network-related
    const errorMsg = error.message?.toLowerCase() || '';
    const isNetworkError = errorMsg.includes('network') || 
                          errorMsg.includes('fetch') || 
                          errorMsg.includes('internet') || 
                          errorMsg.includes('offline') ||
                          errorMsg.includes('connection');

    if (!isNetworkError) {
      console.log('Not a network error, not retrying:', errorMsg);
      return false;
    }

    console.log(`Network error detected (${retryCount + 1}/${maxRetries}), scheduling retry...`);
    
    // Calculate delay with exponential backoff
    const delay = retryDelay * Math.pow(retryBackoffFactor, retryCount);
    setTimeout(() => {
      console.log('Retrying...');
      // You can trigger any retry logic here
    }, delay);

    return true;
  }, [retryCount, maxRetries, retryDelay, retryBackoffFactor]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('Network connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    resetRetries,
    incrementRetry,
    shouldRetry
  };
};

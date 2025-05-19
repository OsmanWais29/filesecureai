
import { useState, useEffect, useCallback } from 'react';

export const useNetworkResilience = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser is online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('Browser is offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetRetries = useCallback(() => {
    setRetryCount(0);
  }, []);

  const incrementRetry = useCallback(() => {
    setRetryCount(prev => Math.min(prev + 1, maxRetries));
  }, []);

  const shouldRetry = useCallback((error: Error | { message: string }) => {
    const errorMessage = error.message.toLowerCase();
    
    // Network or authorization errors are retryable
    const isNetworkError = 
      errorMessage.includes('network') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('timeout') ||
      errorMessage.includes('failed to fetch');
      
    const isAuthError = 
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('auth') || 
      errorMessage.includes('token');
      
    const isRetryable = isNetworkError || isAuthError;
    
    return isRetryable && retryCount < maxRetries;
  }, [retryCount, maxRetries]);

  return {
    isOnline,
    resetRetries,
    incrementRetry,
    shouldRetry,
    retryCount,
    maxRetries
  };
};

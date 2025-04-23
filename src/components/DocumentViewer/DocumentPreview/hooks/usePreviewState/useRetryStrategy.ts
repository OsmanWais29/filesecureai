
import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that provides an enhanced retry strategy with exponential backoff
 * and additional diagnostics for document loading
 */
export function useRetryStrategy(maxAttempts = 3, initialDelay = 1000) {
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [errorStack, setErrorStack] = useState<Error[]>([]);
  const [lastErrorType, setLastErrorType] = useState<string | null>(null);

  // Reset the retry counter
  const resetAttempts = useCallback(() => {
    setAttemptCount(0);
    setLastAttempt(null);
    setErrorStack([]);
    setLastErrorType(null);
  }, []);

  // Increment the retry counter and store error info
  const incrementAttempt = useCallback((error?: Error | string) => {
    setAttemptCount(prev => prev + 1);
    setLastAttempt(new Date());
    
    if (error) {
      // Store error for diagnosis
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      setErrorStack(prev => [...prev, errorObj]);
      
      // Categorize error type
      const errorMessage = errorObj.message.toLowerCase();
      if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
        setLastErrorType('network');
      } else if (errorMessage.includes('token') || errorMessage.includes('auth') || errorMessage.includes('jwt')) {
        setLastErrorType('auth');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        setLastErrorType('timeout');
      } else if (errorMessage.includes('cors') || errorMessage.includes('origin')) {
        setLastErrorType('cors');
      } else {
        setLastErrorType('other');
      }
    }
  }, []);

  // Determine if a retry should be attempted
  const shouldRetry = useCallback((currentAttempts: number) => {
    return currentAttempts < maxAttempts;
  }, [maxAttempts]);

  // Calculate retry delay with exponential backoff and small jitter
  const getRetryDelay = useCallback((attempts: number) => {
    const baseDelay = initialDelay * Math.pow(2, attempts);
    // Add a small random jitter to prevent thundering herd
    const jitter = Math.random() * 300;
    return baseDelay + jitter;
  }, [initialDelay]);

  // Provide diagnostics info
  const getDiagnostics = useCallback(() => {
    return {
      attempts: attemptCount,
      maxAttempts,
      lastAttempt,
      errorStack,
      errorType: lastErrorType,
      remainingAttempts: Math.max(0, maxAttempts - attemptCount)
    };
  }, [attemptCount, maxAttempts, lastAttempt, errorStack, lastErrorType]);

  // Cleanup if component unmounts
  useEffect(() => {
    return () => {
      resetAttempts();
    };
  }, [resetAttempts]);

  return {
    attemptCount,
    incrementAttempt,
    resetAttempts,
    shouldRetry,
    getRetryDelay,
    lastAttempt,
    setLastAttempt,
    maxAttempts,
    lastErrorType,
    errorStack,
    getDiagnostics
  };
}

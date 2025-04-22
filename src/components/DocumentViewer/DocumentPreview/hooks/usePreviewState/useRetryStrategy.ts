
import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that provides retry strategy with exponential backoff
 */
export function useRetryStrategy(maxAttempts = 3, initialDelay = 1000) {
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);

  // Reset the retry counter
  const resetAttempts = useCallback(() => {
    setAttemptCount(0);
    setLastAttempt(null);
  }, []);

  // Increment the retry counter
  const incrementAttempt = useCallback(() => {
    setAttemptCount(prev => prev + 1);
    setLastAttempt(new Date());
  }, []);

  // Determine if a retry should be attempted
  const shouldRetry = useCallback((currentAttempts: number) => {
    return currentAttempts < maxAttempts;
  }, [maxAttempts]);

  // Calculate retry delay with exponential backoff
  const getRetryDelay = useCallback((attempts: number) => {
    return initialDelay * Math.pow(2, attempts);
  }, [initialDelay]);

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
    maxAttempts
  };
}

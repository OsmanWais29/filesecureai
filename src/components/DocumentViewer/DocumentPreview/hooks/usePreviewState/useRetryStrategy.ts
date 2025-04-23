
import { useState, useCallback } from 'react';

export interface UseRetryStrategyReturn {
  attemptCount: number;
  incrementAttempt: (error?: any) => void;
  resetAttempts: () => void;
  lastAttempt: Date | null;
  setLastAttempt: (date: Date) => void;
  shouldRetry: (currentAttempt?: number) => boolean;
  getRetryDelay: (attempt: number) => number;
  lastErrorType: 'network' | 'auth' | 'notFound' | 'unknown' | null;
  getDiagnostics: () => any;
}

export const useRetryStrategy = (maxAttempts = 3): UseRetryStrategyReturn => {
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [lastErrorType, setLastErrorType] = useState<'network' | 'auth' | 'notFound' | 'unknown' | null>(null);
  const [errors, setErrors] = useState<Array<{message: string, timestamp: Date}>>([]);

  // Determine the error type for better handling
  const categorizeError = (error: any): 'network' | 'auth' | 'notFound' | 'unknown' => {
    const errorMsg = error?.message?.toLowerCase() || '';
    
    if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connect')) {
      return 'network';
    } else if (errorMsg.includes('token') || errorMsg.includes('auth') || errorMsg.includes('jwt')) {
      return 'auth';
    } else if (errorMsg.includes('not found') || errorMsg.includes('404')) {
      return 'notFound';
    } else {
      return 'unknown';
    }
  };

  // Calculate exponential backoff delay based on attempt number
  const getRetryDelay = (attempt: number): number => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const calculatedDelay = Math.min(
      maxDelay,
      baseDelay * Math.pow(2, attempt)
    );
    
    // Add a small random jitter to prevent multiple retries at the same time
    return calculatedDelay + Math.random() * 1000;
  };

  // Increment attempt counter and store error
  const incrementAttempt = useCallback((error?: any) => {
    setAttemptCount(prev => prev + 1);
    setLastAttempt(new Date());
    
    if (error) {
      const errorType = categorizeError(error);
      setLastErrorType(errorType);
      
      setErrors(prev => [
        ...prev, 
        { 
          message: error.message || 'Unknown error', 
          timestamp: new Date() 
        }
      ]);
    }
  }, []);

  // Reset attempts counter
  const resetAttempts = useCallback(() => {
    setAttemptCount(0);
    setLastAttempt(null);
    setLastErrorType(null);
  }, []);

  // Determine if we should attempt a retry
  const shouldRetry = useCallback((currentAttempt?: number) => {
    const attempts = currentAttempt !== undefined ? currentAttempt : attemptCount;
    
    // Don't retry if we've reached the maximum number of attempts
    if (attempts >= maxAttempts) {
      return false;
    }
    
    // We should retry for network errors or auth errors
    if (lastErrorType === 'network' || lastErrorType === 'auth') {
      return true;
    }
    
    // For other errors, only retry once
    return attempts < 1;
  }, [attemptCount, lastErrorType, maxAttempts]);
  
  // Function to get diagnostic information
  const getDiagnostics = useCallback(() => ({
    attempts: attemptCount,
    lastAttempt: lastAttempt?.toISOString(),
    errorType: lastErrorType,
    errorHistory: errors
  }), [attemptCount, lastAttempt, lastErrorType, errors]);

  return {
    attemptCount,
    incrementAttempt,
    resetAttempts,
    lastAttempt,
    setLastAttempt,
    shouldRetry,
    getRetryDelay,
    lastErrorType,
    getDiagnostics
  };
};

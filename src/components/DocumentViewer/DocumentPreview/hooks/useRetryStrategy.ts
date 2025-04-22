
import { useState } from 'react';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export interface RetryState {
  attemptCount: number;
  nextRetryDelay: number;
  canRetry: boolean;
}

export function useRetryStrategy({
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000
}: RetryOptions = {}) {
  const [retryState, setRetryState] = useState<RetryState>({
    attemptCount: 0,
    nextRetryDelay: baseDelay,
    canRetry: true
  });

  const retry = () => {
    setRetryState(prev => {
      const nextAttemptCount = prev.attemptCount + 1;
      // Exponential backoff with jitter
      const exponentialDelay = Math.min(
        maxDelay,
        baseDelay * Math.pow(2, nextAttemptCount)
      );
      const jitter = Math.random() * 0.3 * exponentialDelay;
      const nextDelay = Math.floor(exponentialDelay + jitter);
      
      return {
        attemptCount: nextAttemptCount,
        nextRetryDelay: nextDelay,
        canRetry: nextAttemptCount < maxRetries
      };
    });
  };

  const reset = () => {
    setRetryState({
      attemptCount: 0,
      nextRetryDelay: baseDelay,
      canRetry: true
    });
  };

  return {
    ...retryState,
    retry,
    reset
  };
}

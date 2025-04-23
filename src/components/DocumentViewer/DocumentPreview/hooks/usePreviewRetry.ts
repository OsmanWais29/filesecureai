
import { useState, useCallback, useEffect } from "react";

interface Diagnostics {
  attemptCount: number;
  maxRetries: number;
  lastAttempt: Date | null;
  lastErrorType: string | null;
  errorStack: string[];
}

export function usePreviewRetry(maxRetries = 5) {
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<Date | null>(null);
  const [lastErrorType, setLastErrorType] = useState<string | null>(null);
  const [errorStack, setErrorStack] = useState<string[]>([]);

  // Modified to accept an optional errorType parameter
  const incrementAttempt = useCallback((errorType?: string) => {
    setAttemptCount((prev) => prev + 1);
    setLastAttempt(new Date());
    
    // Only update errorType and errorStack if an errorType is provided
    if (errorType) {
      setErrorStack((prev) => [...prev, errorType]);
      setLastErrorType(errorType);
    }
  }, []);

  const resetAttempts = useCallback(() => {
    setAttemptCount(0);
    setLastAttempt(null);
    setLastErrorType(null);
    setErrorStack([]);
  }, []);

  // Determine if a retry should be attempted
  const shouldRetry = useCallback(
    () => attemptCount < maxRetries,
    [attemptCount, maxRetries]
  );

  // Exponential backoff (+jitter)
  const getRetryDelay = useCallback(() => {
    const baseDelay = 1000 * Math.pow(2, attemptCount);
    const jitter = Math.floor(Math.random() * 400);
    return Math.min(15000, baseDelay + jitter);
  }, [attemptCount]);

  const getDiagnostics = useCallback(
    (): Diagnostics => ({
      attemptCount,
      maxRetries,
      lastAttempt,
      lastErrorType,
      errorStack,
    }),
    [attemptCount, maxRetries, lastAttempt, lastErrorType, errorStack]
  );

  useEffect(() => {
    return () => resetAttempts();
  }, [resetAttempts]);

  return {
    attemptCount,
    lastAttempt,
    lastErrorType,
    incrementAttempt,
    resetAttempts,
    shouldRetry,
    getRetryDelay,
    getDiagnostics,
    setLastAttempt,
  };
}

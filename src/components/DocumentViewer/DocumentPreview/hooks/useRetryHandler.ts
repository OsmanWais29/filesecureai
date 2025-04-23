
import { useState, useCallback, useEffect } from "react";

export function useRetryHandler(maxRetries = 5) {
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastErrorType, setLastErrorType] = useState<string | null>(null);

  const resetRetries = useCallback(() => {
    setAttemptCount(0);
    setLastErrorType(null);
  }, []);

  const incrementAttempt = useCallback((error?: Error | string | null) => {
    setAttemptCount((prev) => prev + 1);
    if (error) {
      const msg = typeof error === "string" ? error : (error as Error)?.message || "Unknown error";
      const lower = msg.toLowerCase();
      if (lower.includes("network")) setLastErrorType("network");
      else if (lower.includes("token") || lower.includes("auth") || lower.includes("jwt")) setLastErrorType("auth");
      else if (lower.includes("timeout")) setLastErrorType("timeout");
      else if (lower.includes("cors")) setLastErrorType("cors");
      else setLastErrorType("other");
    }
  }, []);

  const shouldRetry = useCallback(() => attemptCount < maxRetries, [attemptCount, maxRetries]);

  const getRetryDelay = useCallback(() => {
    const base = 1000 * Math.pow(2, attemptCount);
    const jitter = Math.floor(Math.random() * 400);
    return Math.min(15000, base + jitter);
  }, [attemptCount]);

  useEffect(() => () => { resetRetries(); }, [resetRetries]);

  return { attemptCount, lastErrorType, incrementAttempt, resetRetries, shouldRetry, getRetryDelay, setAttemptCount };
}

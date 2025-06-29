
import { useState, useEffect } from 'react';

interface RateLimitingState {
  attempts: number;
  isRateLimited: boolean;
  timeLeft: number;
  recordAttempt: () => void;
  resetAttempts: () => void;
}

export const useRateLimiting = (maxAttempts: number = 5, lockoutDuration: number = 300): RateLimitingState => {
  const [attempts, setAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lockoutStartTime, setLockoutStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRateLimited && lockoutStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lockoutStartTime) / 1000);
        const remaining = lockoutDuration - elapsed;

        if (remaining <= 0) {
          setIsRateLimited(false);
          setTimeLeft(0);
          setAttempts(0);
          setLockoutStartTime(null);
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRateLimited, lockoutStartTime, lockoutDuration]);

  const recordAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= maxAttempts) {
      setIsRateLimited(true);
      setLockoutStartTime(Date.now());
      setTimeLeft(lockoutDuration);
    }
  };

  const resetAttempts = () => {
    setAttempts(0);
    setIsRateLimited(false);
    setTimeLeft(0);
    setLockoutStartTime(null);
  };

  return {
    attempts,
    isRateLimited,
    timeLeft,
    recordAttempt,
    resetAttempts
  };
};

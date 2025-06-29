
import { useState, useEffect } from 'react';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  isLocked: boolean;
}

const RATE_LIMIT_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const useRateLimiting = () => {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    lastAttempt: 0,
    isLocked: false
  });
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const savedState = localStorage.getItem(RATE_LIMIT_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      const now = Date.now();
      
      if (parsed.isLocked && (now - parsed.lastAttempt) < LOCKOUT_DURATION) {
        setState(parsed);
        setTimeLeft(Math.ceil((LOCKOUT_DURATION - (now - parsed.lastAttempt)) / 1000));
      } else if (parsed.attempts >= MAX_ATTEMPTS) {
        // Reset if lockout period has passed
        const resetState = { attempts: 0, lastAttempt: 0, isLocked: false };
        setState(resetState);
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(resetState));
      } else {
        setState(parsed);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isLocked && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            const resetState = { attempts: 0, lastAttempt: 0, isLocked: false };
            setState(resetState);
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(resetState));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isLocked, timeLeft]);

  const recordAttempt = () => {
    const newAttempts = state.attempts + 1;
    const now = Date.now();
    
    const newState = {
      attempts: newAttempts,
      lastAttempt: now,
      isLocked: newAttempts >= MAX_ATTEMPTS
    };

    setState(newState);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(newState));

    if (newState.isLocked) {
      setTimeLeft(LOCKOUT_DURATION / 1000);
    }
  };

  const resetAttempts = () => {
    const resetState = { attempts: 0, lastAttempt: 0, isLocked: false };
    setState(resetState);
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(resetState));
    setTimeLeft(0);
  };

  return {
    attempts: state.attempts,
    isRateLimited: state.isLocked,
    timeLeft,
    recordAttempt,
    resetAttempts
  };
};

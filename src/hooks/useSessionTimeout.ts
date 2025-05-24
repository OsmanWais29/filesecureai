
import { useEffect, useCallback, useRef } from 'react';
import { useAuthState } from './useAuthState';
import { toast } from 'sonner';

interface UseSessionTimeoutOptions {
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  timeoutMinutes = 30,
  warningMinutes = 5,
  onTimeout,
  onWarning
}: UseSessionTimeoutOptions = {}) => {
  const { user, signOut } = useAuthState();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Set warning timer
    warningRef.current = setTimeout(() => {
      if (onWarning) {
        onWarning();
      } else {
        toast.warning(`Your session will expire in ${warningMinutes} minutes due to inactivity.`);
      }
    }, (timeoutMinutes - warningMinutes) * 60 * 1000);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      if (onTimeout) {
        onTimeout();
      } else {
        toast.error('Your session has expired due to inactivity.');
        signOut();
      }
    }, timeoutMinutes * 60 * 1000);
  }, [user, timeoutMinutes, warningMinutes, onTimeout, onWarning, signOut]);

  const handleActivity = useCallback(() => {
    if (user) {
      resetTimer();
    }
  }, [user, resetTimer]);

  useEffect(() => {
    if (!user) {
      // Clear timers when user is not authenticated
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      return;
    }

    // Start timer when user is authenticated
    resetTimer();

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [user, handleActivity, resetTimer]);

  const extendSession = useCallback(() => {
    resetTimer();
    toast.success('Session extended successfully.');
  }, [resetTimer]);

  const getTimeRemaining = useCallback(() => {
    if (!user || !lastActivityRef.current) return 0;
    
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = (timeoutMinutes * 60 * 1000) - elapsed;
    
    return Math.max(0, Math.floor(remaining / 1000));
  }, [user, timeoutMinutes]);

  return {
    extendSession,
    getTimeRemaining,
    resetTimer
  };
};

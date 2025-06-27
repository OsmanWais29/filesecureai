
/**
 * Production-grade authentication hook with enhanced security
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from './useAuthState';
import { securityEnhancer } from '@/utils/securityEnhancer';
import { errorTracker } from '@/utils/errorTracking';
import { supabase } from '@/lib/supabase';

interface ProductionAuthState {
  user: any;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  sessionValid: boolean;
  lastActivity: number;
  securityLevel: 'low' | 'medium' | 'high';
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  checkSessionHealth: () => Promise<boolean>;
  updateSecurityLevel: (level: 'low' | 'medium' | 'high') => void;
}

export const useProductionAuth = (): ProductionAuthState & AuthActions => {
  const { user, session, loading } = useAuthState();
  const [sessionValid, setSessionValid] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [securityLevel, setSecurityLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Session health monitoring
  const checkSessionHealth = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        setSessionValid(false);
        return false;
      }

      // Check if session is close to expiry
      const now = Date.now() / 1000;
      const expiresAt = currentSession.expires_at || 0;
      const timeUntilExpiry = expiresAt - now;

      // Refresh if less than 5 minutes remaining
      if (timeUntilExpiry < 300) {
        await refreshSession();
      }

      setSessionValid(true);
      return true;
    } catch (error) {
      errorTracker.captureError(error as Error, {
        component: 'useProductionAuth',
        severity: 'medium'
      });
      setSessionValid(false);
      return false;
    }
  }, []);

  // Enhanced sign in with security features
  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check rate limiting
      if (!securityEnhancer.checkRateLimit()) {
        return { success: false, error: 'Too many requests. Please try again later.' };
      }

      // Check if account is locked
      if (securityEnhancer.isAccountLocked(email)) {
        return { success: false, error: 'Account temporarily locked due to failed attempts.' };
      }

      // Sanitize inputs
      const sanitizedEmail = securityEnhancer.sanitizeInput(email);
      const sanitizedPassword = securityEnhancer.sanitizeInput(password);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword
      });

      if (error) {
        // Record failed attempt
        securityEnhancer.recordFailedAttempt(sanitizedEmail);
        
        securityEnhancer.logSecurityEvent({
          type: 'failed_login',
          details: { email: sanitizedEmail, error: error.message }
        });

        return { success: false, error: error.message };
      }

      // Reset failed attempts on successful login
      securityEnhancer.resetFailedAttempts(sanitizedEmail);
      securityEnhancer.refreshSession();
      
      securityEnhancer.logSecurityEvent({
        type: 'login',
        userId: data.user?.id,
        details: { email: sanitizedEmail }
      });

      // Set user in error tracker
      if (data.user) {
        errorTracker.setUser(data.user.id, data.user.user_metadata?.user_type);
      }

      setLastActivity(Date.now());
      return { success: true };

    } catch (error) {
      errorTracker.captureError(error as Error, {
        component: 'useProductionAuth',
        severity: 'high'
      });
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }, []);

  // Enhanced sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      securityEnhancer.logSecurityEvent({
        type: 'logout',
        userId: user?.id
      });

      await supabase.auth.signOut();
      
      // Clear security data
      securityEnhancer.clearSecurityEvents();
      setSessionValid(false);
      setLastActivity(0);

    } catch (error) {
      errorTracker.captureError(error as Error, {
        component: 'useProductionAuth',
        severity: 'medium'
      });
    }
  }, [user]);

  // Session refresh
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.refreshSession();
      
      if (error) {
        throw error;
      }

      securityEnhancer.refreshSession();
      setLastActivity(Date.now());
      setSessionValid(true);

    } catch (error) {
      errorTracker.captureError(error as Error, {
        component: 'useProductionAuth',
        severity: 'medium'
      });
      setSessionValid(false);
    }
  }, []);

  // Update security level
  const updateSecurityLevel = useCallback((level: 'low' | 'medium' | 'high') => {
    setSecurityLevel(level);
    
    securityEnhancer.logSecurityEvent({
      type: 'permission_denied', // Reusing for security level changes
      userId: user?.id,
      details: { securityLevel: level }
    });
  }, [user]);

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      securityEnhancer.refreshSession();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Session health monitoring
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(() => {
      checkSessionHealth();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, session, checkSessionHealth]);

  // Session timeout monitoring
  useEffect(() => {
    if (!user || !session) return;

    const checkTimeout = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      const timeoutDuration = 30 * 60 * 1000; // 30 minutes

      if (timeSinceLastActivity > timeoutDuration) {
        signOut();
      }
    };

    const interval = setInterval(checkTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [lastActivity, user, session, signOut]);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session && sessionValid,
    sessionValid,
    lastActivity,
    securityLevel,
    signIn,
    signOut,
    refreshSession,
    checkSessionHealth,
    updateSecurityLevel
  };
};

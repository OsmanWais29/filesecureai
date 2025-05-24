
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { startTokenMonitoring, stopTokenMonitoring, refreshToken } from '@/utils/jwt/tokenManager';

/**
 * Simplified subdomain detection
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }
  
  const hostParts = hostname.split('.');
  if (hostParts.length > 2) {
    return hostParts[0];
  }
  
  return null;
}

/**
 * Simplified auth state hook
 */
export function useAuthState() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Memoized values to avoid recalculation
  const subdomain = useMemo(() => getSubdomain(), []);
  const isClient = useMemo(() => subdomain === 'client', [subdomain]);
  const isTrustee = useMemo(() => user?.user_metadata?.user_type === 'trustee', [user]);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Set up auth listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log(`Auth event: ${event}`);
            
            if (isMounted) {
              setSession(newSession);
              setUser(newSession?.user || null);
              
              if (newSession?.user) {
                startTokenMonitoring();
              } else {
                stopTokenMonitoring();
              }
            }
          }
        );

        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setLoading(false);
          setInitialized(true);
          
          if (currentSession?.user) {
            startTokenMonitoring();
          }
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      stopTokenMonitoring();
    };
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    return refreshToken();
  }, []);

  const signOut = useCallback(async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      stopTokenMonitoring();
      
      toast.success('Signed out successfully');
      
      // Simple redirect based on subdomain
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  }, []);

  return {
    user,
    session,
    loading,
    initialized,
    refreshSession,
    signOut,
    subdomain,
    isClient,
    isTrustee
  };
}

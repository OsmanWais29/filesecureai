
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { startTokenMonitoring, stopTokenMonitoring, refreshToken } from '@/utils/jwt/tokenManager';
import { logAuthEvent, recordSessionEvent } from '@/utils/debugMode';

/**
 * Stand-alone function to refresh session that can be imported elsewhere
 */
export async function refreshSession(): Promise<boolean> {
  return refreshToken();
}

/**
 * Helper function to detect subdomain
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // For localhost testing
  if (hostname === 'localhost') {
    const urlParams = new URLSearchParams(window.location.search);
    const subdomain = urlParams.get('subdomain');
    logAuthEvent(`Detected subdomain from URL params: ${subdomain}`);
    return subdomain;
  }
  
  // For actual domain with subdomains
  const hostParts = hostname.split('.');
  if (hostParts.length > 2) {
    logAuthEvent(`Detected subdomain from hostname: ${hostParts[0]}`);
    return hostParts[0];
  }
  
  logAuthEvent('No subdomain detected');
  return null;
}

/**
 * Hook for managing authentication state
 */
export function useAuthState() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isClient, setIsClient] = useState<boolean | null>(null);
  const [isTrustee, setIsTrustee] = useState<boolean | null>(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  // Record when hook is initialized
  useEffect(() => {
    recordSessionEvent('auth_state_hook_mounted');
    return () => {
      recordSessionEvent('auth_state_hook_unmounted');
    };
  }, []);

  // Detect subdomain on mount - memoized to avoid recreating on each render
  useEffect(() => {
    const detected = getSubdomain();
    logAuthEvent(`useAuthState: Detected subdomain: ${detected || 'none'}`);
    setSubdomain(detected);
    setIsClient(detected === 'client');
    
    recordSessionEvent(`subdomain_detected_${detected || 'none'}`);
  }, []);

  // Handle initial session loading
  useEffect(() => {
    logAuthEvent("useAuthState: Initializing auth state listener");
    recordSessionEvent('auth_initialization_started');
    
    let isMounted = true;
    let authChangeUnsubscribe: () => void | null = null;
    
    const initializeAuth = async () => {
      try {
        // Set up auth state listener FIRST to avoid missing events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            logAuthEvent(`useAuthState: Auth state changed: ${event}`);
            recordSessionEvent(`auth_state_change_${event}`);
            
            if (newSession?.user) {
              logAuthEvent(`useAuthState: User authenticated: ${newSession.user.id}`);
              
              const userType = newSession.user.user_metadata?.user_type;
              logAuthEvent(`useAuthState: User type: ${userType}`);

              if (isMounted) {
                setSession(newSession);
                setUser(newSession.user);
                setIsTrustee(userType === 'trustee');
                setIsClient(userType === 'client');
              }
            } else {
              if (isMounted) {
                setSession(null);
                setUser(null);
                setIsTrustee(false);
                setIsClient(false);
              }
            }
          }
        );

        authChangeUnsubscribe = subscription.unsubscribe;

        // THEN check for existing session - with a small delay to prevent race conditions
        setTimeout(async () => {
          try {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            logAuthEvent(`useAuthState: Retrieved current session: ${currentSession ? "Exists" : "None"}`);
            recordSessionEvent(`auth_session_retrieved_${currentSession ? "exists" : "none"}`);
            
            if (currentSession?.user && isMounted) {
              logAuthEvent(`useAuthState: User ID from session: ${currentSession.user.id}`);
              
              const userType = currentSession.user.user_metadata?.user_type;
              logAuthEvent(`useAuthState: User type from session: ${userType}`);

              setSession(currentSession);
              setUser(currentSession.user);
              setIsTrustee(userType === 'trustee');
              setIsClient(userType === 'client');
              
              // Start token monitoring when we have a session
              startTokenMonitoring();
              recordSessionEvent('token_monitoring_started');
            }
            
            if (isMounted) {
              setLoading(false);
              setInitialized(true);
              recordSessionEvent('auth_initialization_completed');
            }
          } catch (error) {
            logAuthEvent(`useAuthState: Error retrieving session: ${error instanceof Error ? error.message : String(error)}`);
            recordSessionEvent('auth_session_retrieval_error');
            
            if (isMounted) {
              setLoading(false);
              setInitialized(true);
              recordSessionEvent('auth_initialization_completed');
            }
          }
        }, 150); // Increased delay to ensure proper initialization

      } catch (error) {
        logAuthEvent(`useAuthState: Error during initialization: ${error instanceof Error ? error.message : String(error)}`);
        recordSessionEvent('auth_initialization_error');
        
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (authChangeUnsubscribe) authChangeUnsubscribe();
      stopTokenMonitoring();
      recordSessionEvent('auth_cleanup_completed');
    };
  }, []);  // Removed subdomain dependency to prevent reinitialization

  /**
   * Refresh the session explicitly - memoized with useCallback
   */
  const refreshSessionCallback = useCallback(async (): Promise<boolean> => {
    recordSessionEvent('manual_session_refresh_requested');
    return refreshSession();
  }, []);

  /**
   * Sign out the user - memoized with useCallback
   */
  const signOut = useCallback(async () => {
    if (redirectInProgress) {
      logAuthEvent("useAuthState: Sign out prevented due to redirect in progress");
      return; // Prevent multiple sign-out attempts
    }
    
    setRedirectInProgress(true);
    recordSessionEvent('signout_started');
    
    try {
      logAuthEvent("useAuthState: Signing out user...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsClient(false);
      setIsTrustee(false);
      stopTokenMonitoring();
      
      toast.success('Signed out successfully');
      logAuthEvent("useAuthState: Sign out successful");
      recordSessionEvent('signout_successful');

      // Redirect to the correct login page based on subdomain after signout
      setTimeout(() => {
        const currentSubdomain = getSubdomain();
        logAuthEvent(`useAuthState: Redirecting after signout with subdomain: ${currentSubdomain}`);
        recordSessionEvent(`redirect_after_signout_${currentSubdomain || 'none'}`);
        
        // Always go to login page
        window.location.href = '/login';
      }, 150); // Increased delay for more reliable redirect
    } catch (error) {
      logAuthEvent(`useAuthState: Sign out error: ${error instanceof Error ? error.message : String(error)}`);
      recordSessionEvent('signout_error');
      toast.error('Failed to sign out');
      setRedirectInProgress(false);
    }
  }, [redirectInProgress]);

  // Memoize the return value to prevent unnecessary rerenders
  return useMemo(() => ({
    user,
    session,
    loading,
    initialized,
    refreshSession: refreshSessionCallback,
    signOut,
    subdomain,
    isClient,
    isTrustee,
    redirectInProgress
  }), [
    user, 
    session, 
    loading, 
    initialized, 
    refreshSessionCallback,
    signOut,
    subdomain,
    isClient,
    isTrustee,
    redirectInProgress
  ]);
}


import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Stand-alone function to refresh session that can be imported elsewhere
 */
export async function refreshSession(): Promise<boolean> {
  try {
    console.log('Explicitly refreshing auth session...');
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      console.error('Session refresh failed:', error || 'No session returned');
      return false;
    }
    
    console.log('Session refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error during session refresh:', error);
    return false;
  }
}

/**
 * Helper function to detect subdomain
 */
export function getSubdomain(): string | null {
  const hostname = window.location.hostname;
  
  // For localhost testing
  if (hostname === 'localhost') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain');
  }
  
  // For actual domain with subdomains
  const hostParts = hostname.split('.');
  if (hostParts.length > 2) {
    return hostParts[0];
  }
  
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

  // Detect subdomain on mount - memoized to avoid recreating on each render
  useEffect(() => {
    const detected = getSubdomain();
    setSubdomain(detected);
    setIsClient(detected === 'client');
  }, []);

  // Handle initial session loading
  useEffect(() => {
    console.log("Initializing auth state listener...");
    
    let isMounted = true;
    
    // Set up auth state listener FIRST 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        if (newSession?.user) {
          console.log("User authenticated:", newSession.user.id);
          console.log("User metadata:", newSession.user.user_metadata);
          
          const userType = newSession.user.user_metadata?.user_type;
          console.log("User type:", userType);

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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Retrieved current session:", currentSession ? "Exists" : "None");
      
      if (currentSession?.user) {
        console.log("User ID from session:", currentSession.user.id);
        console.log("User metadata from session:", currentSession.user.user_metadata);
        
        const userType = currentSession.user.user_metadata?.user_type;
        console.log("User role from session:", userType);

        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsTrustee(userType === 'trustee');
          setIsClient(userType === 'client');
        }
      }
      
      if (isMounted) {
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [subdomain]);

  /**
   * Refresh the session explicitly - memoized with useCallback
   */
  const refreshSessionCallback = useCallback(async (): Promise<boolean> => {
    return refreshSession();
  }, []);

  /**
   * Sign out the user - memoized with useCallback
   */
  const signOut = useCallback(async () => {
    try {
      console.log("Signing out user...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsClient(false);
      setIsTrustee(false);
      toast.success('Signed out successfully');
      console.log("Sign out successful");

      // Redirect to the correct login page based on subdomain after signout
      if (subdomain === 'client') {
        window.location.href = '/login';
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  }, [subdomain]);

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
    isTrustee
  }), [
    user, 
    session, 
    loading, 
    initialized, 
    refreshSessionCallback,
    signOut,
    subdomain,
    isClient,
    isTrustee
  ]);
}

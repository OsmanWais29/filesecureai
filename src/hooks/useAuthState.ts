
import { useState, useEffect, useCallback } from 'react';
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

  // Detect subdomain on mount
  useEffect(() => {
    setSubdomain(getSubdomain());
  }, []);

  // Handle initial session loading
  useEffect(() => {
    console.log("Initializing auth state listener...");
    
    // Set up auth state listener FIRST 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        console.log("Auth state changed:", _event);
        if (newSession?.user) {
          console.log("User role:", newSession.user.user_metadata?.user_type);

          // Check if user type matches subdomain
          const userType = newSession.user.user_metadata?.user_type;
          if (subdomain === 'client' && userType !== 'client') {
            console.warn("User type mismatch: Trustee account on client subdomain");
          } else if (subdomain !== 'client' && userType !== 'trustee') {
            console.warn("User type mismatch: Client account on trustee subdomain");
          }
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Retrieved current session:", currentSession ? "Exists" : "None");
      if (currentSession?.user) {
        console.log("User role from session:", currentSession.user.user_metadata?.user_type);
      }
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [subdomain]);

  /**
   * Refresh the session explicitly
   */
  const refreshSessionCallback = useCallback(async (): Promise<boolean> => {
    return refreshSession();
  }, []);

  /**
   * Sign out the user
   */
  const signOut = useCallback(async () => {
    try {
      console.log("Signing out user...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
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

  return {
    user,
    session,
    loading,
    refreshSession: refreshSessionCallback,
    signOut,
    subdomain
  };
}

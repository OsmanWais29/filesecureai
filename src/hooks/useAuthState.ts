
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
 * Hook for managing authentication state
 */
export function useAuthState() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle initial session loading
  useEffect(() => {
    // Set up auth state listener FIRST 
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  }, []);

  return {
    user,
    session,
    loading,
    refreshSession: refreshSessionCallback,
    signOut
  };
}

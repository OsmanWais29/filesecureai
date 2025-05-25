
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { detectPortalFromPath } from '@/utils/routing';

export function useAuthState() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Use the routing detection instead of subdomain
  const portalInfo = useMemo(() => detectPortalFromPath(), []);
  
  const { portal, isClient, isTrustee } = portalInfo;

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...', { portal, isClient, isTrustee });
        
        // Set up auth listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log(`Auth event: ${event}`, { portal, user: newSession?.user?.email });
            
            if (isMounted) {
              setSession(newSession);
              setUser(newSession?.user || null);
            }
          }
        );

        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (isMounted) {
          console.log('Current session:', { 
            hasSession: !!currentSession,
            userEmail: currentSession?.user?.email,
            userType: currentSession?.user?.user_metadata?.user_type
          });
          
          setSession(currentSession);
          setUser(currentSession?.user || null);
          setLoading(false);
          setInitialized(true);
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
    };
  }, [portal, isClient, isTrustee]);

  const signOut = useCallback(async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      toast.success('Signed out successfully');
      
      // Redirect to appropriate login
      setTimeout(() => {
        const currentPortal = detectPortalFromPath();
        if (currentPortal.isClient) {
          window.location.href = '/client-login';
        } else {
          window.location.href = '/login';
        }
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
    signOut,
    portal,
    isClient,
    isTrustee
  };
}


import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { authService } from "@/components/auth/authService";

// Utility function to refresh session manually, used for debugging & global error interception
export async function refreshSession() {
  try {
    // Supabase v2 automatically refreshes, but this will trigger a manual refresh if needed
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn("Session fetch error during refresh:", error.message);
      return false;
    }
    if (!data?.session) {
      console.warn("No session found during refresh, user may be logged out.");
      return false;
    }
    // Could force a token refresh here if using low-level JWT tricks, but client auto refreshes if configured
    return true;
  } catch (err) {
    console.error("refreshSession error:", err);
    return false;
  }
}

export const useAuthState = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailConfirmationPending, setIsEmailConfirmationPending] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper to debug token validity
  const logTokenValidity = useCallback((sess: any) => {
    if (!sess || !sess.access_token) {
      console.warn("No access token to check validity.");
      return;
    }
    const jwt = sess.access_token.split('.');
    if (jwt.length !== 3) {
      console.warn("Malformed token.");
      return;
    }
    try {
      const payload = JSON.parse(atob(jwt[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = exp - now;
      console.log(
        `[JWT Check] Token expiry: ${new Date(exp * 1000).toLocaleString()} (${secondsLeft}s left)`
      );
      if (secondsLeft < 120) {
        console.warn("Token will expire soon (within 2min)!");
      }
    } catch (e) {
      console.warn("Failed to decode JWT payload", e);
    }
  }, []);

  // Listen for auth state changes *before* fetching current session
  useEffect(() => {
    console.debug("[Auth] Registering supabase.auth.onAuthStateChange handler FIRST...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Logging all events
        console.info("[AuthEvent]", event, session);

        setSession(session);
        setIsLoading(false);

        // Demo: Display toast and console logs
        if (session?.user && session.user.confirmed_at === null) {
          setIsEmailConfirmationPending(true);
          setConfirmationEmail(session.user.email);
          toast({
            title: "Email Confirmation Required",
            description: "Please check your email for a confirmation link.",
          });
        } else {
          setIsEmailConfirmationPending(false);
          setConfirmationEmail(null);
        }

        // Log token details
        if (session) {
          logTokenValidity(session);
        }

        // If session is gone (user logged out or expired), redirect to login if not already there
        if (!session) {
          // Prevent logout loop if already on login page
          const path = window.location.pathname;
          if (!path.includes("/login") && !path.includes("/auth")) {
            toast({
              variant: "destructive",
              title: "Session Ended",
              description: "Please sign in again to continue.",
            });
            navigate("/login");
          }
        }
      }
    );

    // After listener, then check for current session
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);

      // Double-check email confirmation state if logged in
      if (session?.user) {
        const isConfirmed = session.user.confirmed_at !== null;
        setIsEmailConfirmationPending(!isConfirmed);
        if (!isConfirmed) {
          setConfirmationEmail(session.user.email);
          toast({
            title: "Email Confirmation Required",
            description: "Please check your email for a confirmation link.",
          });
        }
      }

      // Log initial token
      if (session) {
        logTokenValidity(session);
      }
    }).catch(error => {
      console.error("Error fetching session:", error);
      setIsLoading(false);
      setAuthError(error.message);
    });

    return () => subscription.unsubscribe();
  // logTokenValidity ref won't change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, navigate]);

  // 401 global error handler - must use in API client or pageload context
  const handleAuthError = useCallback(async (error) => {
    if (error?.status === 401) {
      console.log("[Auth] Caught 401 error, attempting to refresh session...");
      try {
        const refreshed = await refreshSession();
        if (refreshed) {
          // Instruct parent code to retry request if desired
          return true;
        } else {
          // Not able to refresh token, direct to login
          navigate("/login");
          toast({
            variant: "destructive",
            title: "Session expired",
            description: "Please sign in again to continue.",
          });
        }
      } catch (refreshError) {
        console.error("[Auth] Error during session refresh:", refreshError);
        navigate("/login");
      }
    }
    return false;
  }, [navigate, toast]);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return {
    session,
    isLoading,
    authError,
    isEmailConfirmationPending,
    confirmationEmail,
    handleSignOut,
    handleAuthError,
  };
};


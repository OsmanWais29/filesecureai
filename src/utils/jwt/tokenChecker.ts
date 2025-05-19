
import { supabase } from "@/lib/supabase";
import { logAuthEvent } from "../debugMode";

/**
 * Verifies the JWT token and returns information about its validity
 */
export const checkJwtToken = async (): Promise<{
  isValid: boolean;
  timeRemaining?: number; // In seconds
  reason?: string;
}> => {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        isValid: false,
        reason: sessionError ? sessionError.message : "No active session"
      };
    }
    
    // Check token expiration
    const expiresAt = session.expires_at ? session.expires_at : null;
    
    if (!expiresAt) {
      return {
        isValid: true, // No expiry found, assume it's valid
      };
    }
    
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const expiresAtSeconds = expiresAt;
    const timeRemaining = expiresAtSeconds - nowInSeconds;
    
    // Check if token is expired or about to expire
    if (timeRemaining <= 0) {
      return {
        isValid: false,
        timeRemaining: 0,
        reason: "Token has expired"
      };
    }
    
    return {
      isValid: true,
      timeRemaining: timeRemaining
    };
  } catch (error) {
    logAuthEvent(`JWT verification error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      isValid: false,
      reason: `Error verifying token: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};


import { supabase } from "@/lib/supabase";

/**
 * Utility function to diagnose JWT token issues
 */
export const verifyJwtToken = async (): Promise<{ 
  isValid: boolean; 
  reason?: string;
}> => {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData || !sessionData.session) {
      console.warn("JWT verification failed: No active session found");
      return {
        isValid: false,
        reason: 'No active session found'
      };
    }
    
    const token = sessionData.session.access_token;
    
    // Basic token structure check
    if (!token || token.split('.').length !== 3) {
      console.warn("JWT verification failed: Token has invalid format");
      return {
        isValid: false,
        reason: 'Token has invalid format'
      };
    }
    
    // Check expiration
    const expiresAt = sessionData.session.expires_at;
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (expiresAt < currentTime) {
      console.warn("JWT verification failed: Token has expired");
      return {
        isValid: false,
        reason: 'Token has expired'
      };
    }
    
    console.log("JWT verification passed: Token is valid");
    return {
      isValid: true
    };
    
  } catch (error) {
    console.error("JWT verification error:", error);
    return {
      isValid: false,
      reason: error instanceof Error ? error.message : 'Unknown error checking JWT'
    };
  }
};

/**
 * Attempts to refresh JWT token
 */
export const refreshJwtToken = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      console.error("Failed to refresh token:", error);
      return false;
    }
    
    console.log("Token refreshed successfully");
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
};

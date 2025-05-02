
import { supabase } from "@/lib/supabase";
import { verifyJwtToken } from "./jwtVerifier";

/**
 * Runs pre-upload diagnostics to ensure the JWT token is valid
 */
export const maybeRunDiagnostics = async (file: File, runDiagnostics = false) => {
  if (!runDiagnostics && file.type !== 'application/pdf') {
    return { valid: true };
  }
  
  try {
    const tokenStatus = await verifyJwtToken();
    
    if (!tokenStatus.isValid) {
      console.warn(`Token validation failed: ${tokenStatus.reason}`);
      
      // Try immediate refresh if token is invalid
      await refreshJwt();
      
      // Check again after refresh
      const refreshedStatus = await verifyJwtToken();
      if (!refreshedStatus.isValid) {
        return {
          valid: false,
          reason: `Authentication issue: ${refreshedStatus.reason}`
        };
      }
    }
    
    return { valid: true };
  } catch (error) {
    console.error("Diagnostics error:", error);
    return { 
      valid: false, 
      reason: error instanceof Error ? error.message : "Unknown diagnostic error" 
    };
  }
};

/**
 * Refreshes the JWT token
 */
export const refreshJwt = async (aggressive = false): Promise<boolean> => {
  try {
    // First try normal refresh
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.warn("Initial refresh failed:", error);
      
      if (aggressive) {
        // If aggressive mode, try signing in with stored credentials
        // This is a placeholder - in a real implementation, you might try to
        // re-authenticate using stored credentials or a token in localStorage
        console.log("Attempting aggressive token refresh...");
        
        // For now, just show we're attempting this mode
        return false;
      }
      
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    console.error("Error refreshing JWT:", error);
    return false;
  }
};

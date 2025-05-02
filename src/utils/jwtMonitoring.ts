
import { supabase } from "@/lib/supabase";

let monitoringActive = false;
let monitoringInterval: number | null = null;
const MONITORING_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

/**
 * Verifies the JWT token's validity
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
 * Refreshes the JWT token if necessary
 */
export const checkAndRefreshToken = async (): Promise<{
  isValid: boolean;
  wasRefreshed: boolean;
  reason?: string;
}> => {
  try {
    const status = await verifyJwtToken();
    
    if (!status.isValid) {
      console.log("Token invalid, refreshing...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error("Failed to refresh token:", error);
        return {
          isValid: false,
          wasRefreshed: false,
          reason: error?.message || "Failed to refresh session"
        };
      }
      
      console.log("Token refreshed successfully");
      return {
        isValid: true,
        wasRefreshed: true
      };
    }
    
    return {
      isValid: true,
      wasRefreshed: false
    };
  } catch (error) {
    console.error("Error in checkAndRefreshToken:", error);
    return {
      isValid: false,
      wasRefreshed: false,
      reason: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

/**
 * Fixes authentication issues by refreshing tokens
 */
export const fixAuthenticationIssues = async (): Promise<boolean> => {
  try {
    const { wasRefreshed } = await checkAndRefreshToken();
    return wasRefreshed;
  } catch (error) {
    console.error("Error fixing auth issues:", error);
    return false;
  }
};

/**
 * Starts JWT monitoring service
 */
export const startJwtMonitoring = (): void => {
  if (monitoringActive) {
    return; // Already running
  }
  
  monitoringActive = true;
  console.log("JWT monitoring started");
  
  // Run an initial check
  checkAndRefreshToken();
  
  // Setup interval
  monitoringInterval = window.setInterval(() => {
    checkAndRefreshToken();
  }, MONITORING_INTERVAL);
};

/**
 * Stops JWT monitoring service
 */
export const stopJwtMonitoring = (): void => {
  if (!monitoringActive || monitoringInterval === null) {
    return;
  }
  
  clearInterval(monitoringInterval);
  monitoringInterval = null;
  monitoringActive = false;
  console.log("JWT monitoring stopped");
};

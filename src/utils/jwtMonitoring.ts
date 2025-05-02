
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Token refresh interval in milliseconds (5 minutes)
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

// Store the interval ID for cleanup
let monitoringIntervalId: number | null = null;

/**
 * Start JWT token monitoring with automatic refresh
 */
export const startJwtMonitoring = (): void => {
  // Clear any existing interval first
  stopJwtMonitoring();
  
  console.log("Starting JWT monitoring...");
  
  // Check token immediately on start
  checkAndRefreshToken();
  
  // Set up regular monitoring
  monitoringIntervalId = window.setInterval(() => {
    checkAndRefreshToken().catch(error => {
      console.error("Error in JWT monitoring:", error);
    });
  }, TOKEN_REFRESH_INTERVAL);
};

/**
 * Stop JWT token monitoring
 */
export const stopJwtMonitoring = (): void => {
  if (monitoringIntervalId !== null) {
    clearInterval(monitoringIntervalId);
    monitoringIntervalId = null;
    console.log("JWT monitoring stopped");
  }
};

/**
 * Checks the current JWT token validity and refreshes if needed
 * @returns Promise with token status information
 */
export const checkAndRefreshToken = async (): Promise<{ 
  isValid: boolean; 
  reason?: string;
  refreshed?: boolean;
}> => {
  try {
    // Get current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData || !sessionData.session) {
      console.error('No active session found');
      return {
        isValid: false,
        reason: 'No active session found'
      };
    }
    
    // Check if token is close to expiration (within 5 minutes)
    const expiresAt = sessionData.session.expires_at;
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - currentTime;
    
    // If token expires in less than 5 minutes (300 seconds), refresh it
    if (timeUntilExpiry < 300) {
      console.log(`Token expiring soon (${timeUntilExpiry}s remaining). Refreshing...`);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        return {
          isValid: false,
          reason: `Failed to refresh session: ${error.message}`
        };
      }
      
      console.log('Token refreshed successfully');
      return {
        isValid: true,
        refreshed: true
      };
    }
    
    // Token is valid and not close to expiry
    return {
      isValid: true
    };
    
  } catch (error) {
    console.error('Error checking/refreshing token:', error);
    return {
      isValid: false,
      reason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

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
      return {
        isValid: false,
        reason: 'No active session found'
      };
    }
    
    const token = sessionData.session.access_token;
    
    // Basic token structure check
    if (!token || token.split('.').length !== 3) {
      return {
        isValid: false,
        reason: 'Token has invalid format'
      };
    }
    
    // Check expiration
    const expiresAt = sessionData.session.expires_at;
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (expiresAt < currentTime) {
      return {
        isValid: false,
        reason: 'Token has expired'
      };
    }
    
    return {
      isValid: true
    };
    
  } catch (error) {
    return {
      isValid: false,
      reason: error instanceof Error ? error.message : 'Unknown error checking JWT'
    };
  }
};

/**
 * Fix common JWT authentication issues
 */
export const fixAuthenticationIssues = async (): Promise<boolean> => {
  try {
    toast.info("Attempting to resolve authentication issues...");
    
    // First check the current token
    const tokenStatus = await verifyJwtToken();
    
    if (!tokenStatus.isValid) {
      console.log(`Token invalid: ${tokenStatus.reason}`);
      
      // Try to refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        console.error("Failed to refresh session:", error);
        
        // Try to reuse any existing session
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          toast.error("Authentication error: Your session has expired. Please log in again.");
          return false;
        }
      }
      
      toast.success("Authentication refreshed successfully");
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error fixing authentication:", error);
    toast.error("Failed to resolve authentication issues");
    return false;
  }
};

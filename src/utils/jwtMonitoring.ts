
import { JWTVerificationResult } from "./jwtDiagnosticsTypes";
import { supabase } from "@/lib/supabase";

// How frequently to check token validity (in ms)
const TOKEN_CHECK_INTERVAL = 4 * 60 * 1000; // 4 minutes

// Minimum remaining validity time to consider a token valid (in seconds)
const MIN_TOKEN_VALIDITY = 300; // 5 minutes

// In-memory state to track last refresh time
let lastRefreshTime = 0;
let monitoringInterval: number | null = null;

/**
 * Start background monitoring of JWT token, refreshing when needed
 */
export function startJwtMonitoring(): void {
  if (monitoringInterval) {
    console.log("JWT monitoring already running");
    return;
  }

  // Initial check
  checkAndRefreshToken();

  // Set up interval
  monitoringInterval = window.setInterval(() => {
    checkAndRefreshToken();
  }, TOKEN_CHECK_INTERVAL);

  console.log("JWT token monitoring started");
}

/**
 * Stop background JWT monitoring
 */
export function stopJwtMonitoring(): void {
  if (monitoringInterval) {
    window.clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log("JWT token monitoring stopped");
  }
}

/**
 * Check token validity and refresh if needed
 */
export async function checkAndRefreshToken(): Promise<JWTVerificationResult> {
  try {
    // Get current session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking session:", error.message);
      return { isValid: false, reason: "Session check failed", error };
    }

    if (!data?.session) {
      console.log("No active session found during JWT check");
      return { isValid: false, reason: "No active session" };
    }

    const token = data.session.access_token;
    const payload = parseJwt(token);

    if (!payload) {
      console.error("Failed to parse JWT payload");
      return { isValid: false, reason: "Invalid token format" };
    }

    // Check expiration
    const expiryTime = new Date(payload.exp * 1000);
    const currentTime = new Date();
    const timeRemaining = (expiryTime.getTime() - currentTime.getTime()) / 1000;

    // If token is expiring soon, refresh it
    if (timeRemaining < MIN_TOKEN_VALIDITY) {
      console.log(`Token expires in ${timeRemaining.toFixed(0)} seconds, refreshing...`);
      
      // Prevent multiple refreshes in short time
      const now = Date.now();
      if (now - lastRefreshTime < 10000) {
        console.log("Skipping refresh, too soon since last refresh");
        return { 
          isValid: true, 
          timeRemaining, 
          expiresAt: expiryTime,
          currentTime,
          payload
        };
      }
      
      // Refresh the token
      const { error: refreshError } = await supabase.auth.refreshSession();
      lastRefreshTime = Date.now();
      
      if (refreshError) {
        console.error("Failed to refresh token:", refreshError.message);
        return { 
          isValid: timeRemaining > 0, 
          reason: refreshError.message,
          timeRemaining, 
          expiresAt: expiryTime,
          currentTime,
          payload,
          error: refreshError
        };
      }
      
      console.log("Token refreshed successfully");
      
      // Get updated session after refresh
      const { data: refreshedData } = await supabase.auth.getSession();
      if (refreshedData?.session) {
        const newPayload = parseJwt(refreshedData.session.access_token);
        const newExpiry = new Date(newPayload.exp * 1000);
        const newTimeRemaining = (newExpiry.getTime() - currentTime.getTime()) / 1000;
        
        console.log(`New token expires in ${newTimeRemaining.toFixed(0)} seconds`);
        
        return {
          isValid: true,
          timeRemaining: newTimeRemaining,
          expiresAt: newExpiry,
          currentTime,
          payload: newPayload
        };
      }
    }

    // Token is valid and not expiring soon
    return {
      isValid: true,
      timeRemaining,
      expiresAt: expiryTime,
      currentTime,
      payload
    };
  } catch (error) {
    console.error("Error in checkAndRefreshToken:", error);
    return { isValid: false, reason: "Token check failed", error };
  }
}

/**
 * Parse JWT token to get payload
 */
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
}

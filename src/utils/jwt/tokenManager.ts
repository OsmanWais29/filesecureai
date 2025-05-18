
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * TokenManager - A centralized utility for JWT token management
 */

// Token expiration buffer (in seconds)
const TOKEN_REFRESH_BUFFER = 300; // Refresh token if less than 5 minutes until expiry

/**
 * Check if the current token is valid and will remain valid for the buffer period
 */
export const isTokenValid = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    if (!session) {
      console.warn("No active session found");
      return false;
    }
    
    // Parse token to check expiration
    const token = session.access_token;
    const parts = token.split(".");
    
    if (parts.length !== 3) {
      console.warn("Invalid JWT format");
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      
      // Token is valid if it's not expired and won't expire within buffer
      return expiresAt > now + TOKEN_REFRESH_BUFFER;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return false;
    }
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

/**
 * Refresh the JWT token
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      console.error("Failed to refresh token:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
};

/**
 * Ensure the token is valid, refreshing if needed
 */
export const ensureValidToken = async (): Promise<boolean> => {
  const valid = await isTokenValid();
  
  if (!valid) {
    console.log("Token needs refreshing");
    return await refreshToken();
  }
  
  return true;
};

/**
 * Use for critical operations that require a fresh token
 * @param operation The operation to perform with a guaranteed fresh token
 */
export const withFreshToken = async <T>(operation: () => Promise<T>): Promise<T> => {
  const tokenValid = await ensureValidToken();
  
  if (!tokenValid) {
    toast.error("Authentication expired. Please log in again.");
    throw new Error("Authentication expired");
  }
  
  try {
    return await operation();
  } catch (error: any) {
    // Check if the error is related to JWT
    const isJwtError = 
      error?.error === 'InvalidJWT' || 
      (error?.message && (error.message.includes('JWT') || error.message.includes('token'))) || 
      error?.statusCode === 400;
      
    if (isJwtError) {
      // Try once more with a forced token refresh
      const refreshed = await refreshToken();
      if (refreshed) {
        return await operation();
      } else {
        toast.error("Authentication failed. Please log in again.");
        throw new Error("Authentication failed after token refresh");
      }
    }
    
    throw error;
  }
};

/**
 * Start automatic token monitoring
 */
let tokenMonitorInterval: number | null = null;

export const startTokenMonitoring = (intervalMs = 60000) => {
  // Clear any existing monitoring
  stopTokenMonitoring();
  
  tokenMonitorInterval = window.setInterval(async () => {
    const shouldRefresh = !(await isTokenValid());
    if (shouldRefresh) {
      console.log("Token monitoring: refreshing token");
      await refreshToken();
    }
  }, intervalMs);
  
  console.log("Token monitoring started");
};

export const stopTokenMonitoring = () => {
  if (tokenMonitorInterval !== null) {
    window.clearInterval(tokenMonitorInterval);
    tokenMonitorInterval = null;
    console.log("Token monitoring stopped");
  }
};


import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Track token state
let tokenMonitoringActive = false;
let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
const TOKEN_EXPIRY_BUFFER = 10 * 60; // 10 minutes in seconds

// Check if a token needs refreshing based on its expiry
const needsRefresh = (expiresAt: number): boolean => {
  if (!expiresAt) return true;
  
  // Get current time in seconds
  const now = Math.floor(Date.now() / 1000);
  // Check if token will expire within buffer period
  return expiresAt - now < TOKEN_EXPIRY_BUFFER;
};

// Check if a token is valid
export const isTokenValid = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    // Check if token has expired
    const now = Math.floor(Date.now() / 1000);
    return session.expires_at ? session.expires_at > now : false;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

// Refresh the token if needed
export async function refreshToken(): Promise<boolean> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No session to refresh");
      return false;
    }
    
    // Check if token needs refresh
    if (session.expires_at && !needsRefresh(session.expires_at)) {
      console.log("Token is still valid, no need to refresh");
      return true;
    }
    
    console.log("Token needs refreshing, attempting refresh...");
    
    // Perform refresh
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      console.error("Failed to refresh token:", error);
      return false;
    }
    
    console.log("Token refreshed successfully");
    return true;
  } catch (error) {
    console.error("Token refresh failed with exception:", error);
    return false;
  }
}

// Ensure token is valid before operation
export async function withFreshToken<T>(operation: () => Promise<T>): Promise<T> {
  // Try to refresh the token first
  await refreshToken();
  // Then perform the operation
  return await operation();
}

// Start monitoring token and refreshing as needed
export function startTokenMonitoring(): void {
  // Don't start multiple intervals
  if (tokenMonitoringActive) {
    return;
  }
  
  console.log("Starting token monitoring");
  tokenMonitoringActive = true;
  
  // Setup immediate refresh check
  refreshToken();
  
  // Setup interval for regular checks
  tokenRefreshInterval = setInterval(async () => {
    try {
      const success = await refreshToken();
      
      if (!success) {
        console.warn("Token refresh failed during monitoring cycle");
      }
    } catch (error) {
      console.error("Error in token monitoring cycle:", error);
    }
  }, TOKEN_REFRESH_INTERVAL);
}

// Stop monitoring token
export function stopTokenMonitoring(): void {
  if (!tokenMonitoringActive || !tokenRefreshInterval) return;
  
  console.log("Stopping token monitoring");
  clearInterval(tokenRefreshInterval);
  tokenRefreshInterval = null;
  tokenMonitoringActive = false;
}

// Check if token is valid, useful for route guards
export async function ensureValidToken(): Promise<boolean> {
  return await refreshToken();
}


import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { logAuthEvent, recordSessionEvent } from '@/utils/debugMode';

// Track token state
let tokenMonitoringActive = false;
let tokenRefreshInterval: ReturnType<typeof setInterval> | null = null;
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
const TOKEN_EXPIRY_BUFFER = 10 * 60; // 10 minutes in seconds

// Global refresh lock to prevent concurrent refresh attempts
let isRefreshingToken = false;

/**
 * Semaphore-like lock to prevent concurrent refreshes
 * @returns Lock release function
 */
const acquireRefreshLock = async (): Promise<boolean> => {
  if (isRefreshingToken) {
    logAuthEvent("Token refresh already in progress, skipping duplicate attempt");
    return false;
  }
  
  isRefreshingToken = true;
  return true;
};

/**
 * Release the refresh lock
 */
const releaseRefreshLock = (): void => {
  isRefreshingToken = false;
};

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
      logAuthEvent("Token validity check: No session found");
      return false;
    }
    
    // Check if token has expired
    const now = Math.floor(Date.now() / 1000);
    const isValid = session.expires_at ? session.expires_at > now : false;
    
    logAuthEvent(`Token validity check: ${isValid ? 'Valid' : 'Expired'}, expires at: ${session.expires_at}`);
    return isValid;
  } catch (error) {
    logAuthEvent(`Error checking token validity: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};

// Refresh the token if needed, with concurrency protection
export async function refreshToken(): Promise<boolean> {
  try {
    // Prevent concurrent refreshes which could cause race conditions
    const lockAcquired = await acquireRefreshLock();
    if (!lockAcquired) {
      // Another refresh already in progress, wait for it
      return true;
    }
    
    recordSessionEvent('token_refresh_start');
    logAuthEvent("Starting token refresh operation");
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        logAuthEvent("No session to refresh");
        return false;
      }
      
      // Check if token needs refresh
      if (session.expires_at && !needsRefresh(session.expires_at)) {
        const expiresInMinutes = Math.round((session.expires_at - Math.floor(Date.now() / 1000)) / 60);
        logAuthEvent(`Token is still valid for ${expiresInMinutes} minutes, no refresh needed`);
        return true;
      }
      
      logAuthEvent("Token needs refreshing, attempting refresh...");
      
      // Perform refresh
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        logAuthEvent(`Failed to refresh token: ${error?.message || 'Unknown error'}`);
        return false;
      }
      
      const newExpiresInMinutes = Math.round((data.session.expires_at || 0) - Math.floor(Date.now() / 1000)) / 60;
      logAuthEvent(`Token refreshed successfully, new expiry in ${newExpiresInMinutes.toFixed(1)} minutes`);
      recordSessionEvent('token_refreshed_success');
      return true;
    } finally {
      // Always release the lock, even if an error occurs
      releaseRefreshLock();
    }
  } catch (error) {
    logAuthEvent(`Token refresh failed with exception: ${error instanceof Error ? error.message : String(error)}`);
    recordSessionEvent('token_refresh_error');
    // Release lock on exception
    releaseRefreshLock();
    return false;
  }
}

// Ensure token is valid before operation, with retry logic
export async function withFreshToken<T>(operation: () => Promise<T>, retries = 1): Promise<T> {
  try {
    // Try to refresh the token first
    const refreshSuccess = await refreshToken();
    
    if (!refreshSuccess && retries > 0) {
      logAuthEvent(`Token refresh failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Add delay before retry
      return withFreshToken(operation, retries - 1);
    }
    
    // Then perform the operation
    return await operation();
  } catch (error) {
    logAuthEvent(`Error in withFreshToken: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

// Start monitoring token and refreshing as needed
export function startTokenMonitoring(): void {
  // Don't start multiple intervals
  if (tokenMonitoringActive) {
    logAuthEvent("Token monitoring already active, not starting again");
    return;
  }
  
  logAuthEvent("Starting token monitoring");
  recordSessionEvent('token_monitoring_started');
  tokenMonitoringActive = true;
  
  // Setup immediate refresh check
  refreshToken();
  
  // Setup interval for regular checks with jitter to avoid thundering herd
  const jitter = Math.random() * 1000; // Random jitter up to 1 second
  tokenRefreshInterval = setInterval(async () => {
    try {
      logAuthEvent("Performing scheduled token refresh check");
      const success = await refreshToken();
      
      if (!success) {
        logAuthEvent("Token refresh failed during monitoring cycle");
        recordSessionEvent('token_refresh_failed_during_monitoring');
      }
    } catch (error) {
      logAuthEvent(`Error in token monitoring cycle: ${error instanceof Error ? error.message : String(error)}`);
      recordSessionEvent('token_monitoring_error');
    }
  }, TOKEN_REFRESH_INTERVAL + jitter);
}

// Stop monitoring token
export function stopTokenMonitoring(): void {
  if (!tokenMonitoringActive || !tokenRefreshInterval) return;
  
  logAuthEvent("Stopping token monitoring");
  recordSessionEvent('token_monitoring_stopped');
  clearInterval(tokenRefreshInterval);
  tokenRefreshInterval = null;
  tokenMonitoringActive = false;
}

// Check if token is valid, useful for route guards
export async function ensureValidToken(): Promise<boolean> {
  recordSessionEvent('ensure_valid_token_check');
  return await refreshToken();
}

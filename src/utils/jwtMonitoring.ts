
import { supabase } from "@/lib/supabase";

interface TokenStatus {
  isValid: boolean;
  reason?: string;
  expiry?: number;
  remainingTime?: number;
}

/**
 * Monitors JWT token status and handles refresh
 */
let monitoringInterval: ReturnType<typeof setInterval> | null = null;
let lastRefreshAttempt = 0;

/**
 * Start monitoring the JWT token and refresh if needed
 */
export function startJwtMonitoring(intervalMs = 60000) {
  if (monitoringInterval) {
    stopJwtMonitoring();
  }
  
  monitoringInterval = setInterval(() => {
    checkAndRefreshToken().catch(err => {
      console.error('JWT monitoring error:', err);
    });
  }, intervalMs);
  
  console.log('JWT token monitoring started');
  
  // Perform initial check
  checkAndRefreshToken().catch(err => {
    console.error('Initial JWT check error:', err);
  });
  
  return () => stopJwtMonitoring();
}

/**
 * Stop the JWT monitoring
 */
export function stopJwtMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('JWT token monitoring stopped');
  }
}

/**
 * Check the JWT token status and refresh if needed
 */
export async function checkAndRefreshToken(forceRefresh = false): Promise<TokenStatus> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { isValid: false, reason: 'No active session found' };
    }
    
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const token = session.access_token;
    
    if (!token) {
      return { isValid: false, reason: 'No access token in session' };
    }
    
    // Parse JWT to get expiry
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
      return { isValid: false, reason: 'Invalid token format or missing expiry' };
    }
    
    const expiryTime = payload.exp;
    const remainingTime = expiryTime - now;
    
    // Token is expired or about to expire soon (within 5 minutes)
    const needsRefresh = remainingTime < 300 || forceRefresh;
    
    // Throttle refresh attempts to avoid hammering the auth endpoint
    if (needsRefresh && (forceRefresh || now - lastRefreshAttempt > 60)) {
      console.log(`JWT token ${forceRefresh ? 'force refresh' : 'expiring soon'}. Refreshing...`);
      lastRefreshAttempt = now;
      
      // Try to refresh the session
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Token refresh failed:', error);
        return { 
          isValid: false, 
          reason: `Token refresh failed: ${error.message}`,
          expiry: expiryTime,
          remainingTime 
        };
      }
      
      if (!data.session) {
        return { 
          isValid: false, 
          reason: 'No session returned after refresh',
          expiry: expiryTime,
          remainingTime  
        };
      }
      
      console.log('JWT token refreshed successfully');
      
      // Parse new token to get updated expiry
      const newPayload = parseJwt(data.session.access_token);
      const newExpiry = newPayload?.exp;
      const newRemainingTime = newExpiry ? newExpiry - now : undefined;
      
      return { 
        isValid: true,
        expiry: newExpiry,
        remainingTime: newRemainingTime
      };
    }
    
    // Token is still valid
    const status = { 
      isValid: true,
      expiry: expiryTime,
      remainingTime
    };
    
    // Log token status for debugging (only occasionally)
    if (Math.random() < 0.1) { // Log only ~10% of the time
      console.log(`JWT token valid for ${Math.floor(remainingTime / 60)} minutes`);
    }
    
    return status;
  } catch (error) {
    console.error('Error checking JWT token status:', error);
    return { 
      isValid: false, 
      reason: `Error checking token: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Parse a JWT token and return the payload
 */
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

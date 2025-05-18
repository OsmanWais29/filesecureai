
import { supabase } from '@/lib/supabase';
import { recordSessionEvent, logAuthEvent, logError } from './debugMode';
import { runStorageDiagnostics } from './browserDiagnostics';
import { refreshToken } from './jwt/tokenManager';

/**
 * Advanced diagnostic tool to identify auth and routing issues
 */
export const authDebug = {
  /**
   * Log detailed auth state including tokens and expiry
   */
  async checkAuthState(): Promise<{
    hasSession: boolean;
    expiresIn?: number;
    userType?: string | null;
    tokenInfo?: {
      valid: boolean;
      expiresAt?: Date;
    };
    storageDiagnostics?: {
      localStorage: boolean;
      cookies: boolean;
      privateMode: boolean;
    };
  }> {
    try {
      recordSessionEvent('auth_debug_check_started');
      logAuthEvent("Starting comprehensive auth state check");
      
      // Get current session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (!session) {
        logAuthEvent("AuthDebug: No active session");
        
        // Check if we have storage issues that could be preventing sessions
        const storageDiags = await runStorageDiagnostics();
        
        recordSessionEvent('auth_debug_no_session');
        
        return { 
          hasSession: false,
          storageDiagnostics: {
            localStorage: storageDiags.localStorage.available,
            cookies: storageDiags.cookies.enabled,
            privateMode: storageDiags.privateMode.isPrivate
          }
        };
      }
      
      // Extract token information
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = expiresAt ? expiresAt - now : undefined;
      
      // Extract user type
      const userType = session.user?.user_metadata?.user_type;
      
      // Check token validity
      const tokenValid = expiresAt ? expiresAt > now : false;
      
      // If token is expiring soon (less than 5 minutes), refresh it
      if (tokenValid && expiresIn && expiresIn < 300) {
        logAuthEvent(`AuthDebug: Token expiring soon (${expiresIn}s), triggering refresh`);
        await refreshToken();
      }
      
      // Get updated storage diagnostics
      const storageDiags = await runStorageDiagnostics();
      
      const result = {
        hasSession: true,
        expiresIn: expiresIn,
        userType,
        tokenInfo: {
          valid: tokenValid,
          expiresAt: expiresAt ? new Date(expiresAt * 1000) : undefined,
        },
        storageDiagnostics: {
          localStorage: storageDiags.localStorage.available,
          cookies: storageDiags.cookies.enabled,
          privateMode: storageDiags.privateMode.isPrivate
        }
      };
      
      logAuthEvent("AuthDebug: Session state", result);
      recordSessionEvent('auth_debug_check_complete');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(error, 'auth_debug_check');
      recordSessionEvent('auth_debug_error');
      
      return { 
        hasSession: false,
        tokenInfo: {
          valid: false,
        }
      };
    }
  },
  
  /**
   * Log detailed routing information
   */
  logRouteInfo(pathname: string, expectedRole?: string) {
    const currentTime = new Date().toISOString();
    
    const routeInfo = {
      currentPath: pathname,
      expectedRole,
      subdomain: getSubdomainFromURL(),
      referrer: document.referrer || 'none',
      timestamp: currentTime
    };
    
    logAuthEvent(`🧭 Route Debug [${currentTime}]:`, routeInfo);
    recordSessionEvent(`route_access_${pathname}`);
    
    return routeInfo;
  },
  
  /**
   * Verify authentication for protected routes
   */
  async verifyAuthForRoute(pathname: string, requiredRole?: string): Promise<{
    authenticated: boolean;
    authorized: boolean;
    reason?: string;
    tokenValid?: boolean;
    userType?: string | null;
  }> {
    try {
      recordSessionEvent(`route_auth_verification_${pathname}`);
      
      // Get current session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (!session) {
        logAuthEvent(`Auth verification failed for ${pathname}: No session`);
        return {
          authenticated: false,
          authorized: false,
          reason: 'No active session'
        };
      }
      
      // Check token validity
      const now = Math.floor(Date.now() / 1000);
      const tokenValid = session.expires_at ? session.expires_at > now : false;
      
      if (!tokenValid) {
        logAuthEvent(`Auth verification failed for ${pathname}: Token expired`);
        return {
          authenticated: false,
          authorized: false,
          tokenValid: false,
          reason: 'Token expired'
        };
      }
      
      // Extract user type and check against required role
      const userType = session.user?.user_metadata?.user_type;
      const authorized = !requiredRole || userType === requiredRole;
      
      if (!authorized) {
        logAuthEvent(`Auth verification failed for ${pathname}: Role mismatch - Required: ${requiredRole}, User: ${userType}`);
      } else {
        logAuthEvent(`Auth verification succeeded for ${pathname}: Role matches - Required: ${requiredRole}, User: ${userType}`);
      }
      
      return {
        authenticated: true,
        authorized,
        tokenValid,
        userType,
        reason: !authorized ? `Role mismatch (required: ${requiredRole}, user: ${userType})` : undefined
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(error, 'route_auth_verification');
      recordSessionEvent(`route_auth_verification_error_${pathname}`);
      
      return {
        authenticated: false,
        authorized: false,
        reason: `Error during verification: ${errorMessage}`
      };
    }
  },
  
  /**
   * Export debug data for troubleshooting
   */
  async exportDebugData(): Promise<Record<string, any>> {
    try {
      // Get current auth state
      const authState = await this.checkAuthState();
      
      // Get route info
      const routeInfo = this.logRouteInfo(window.location.pathname);
      
      // Get storage diagnostics
      const storageDiags = await runStorageDiagnostics();
      
      // Export detailed debug data
      return {
        timestamp: new Date().toISOString(),
        authState,
        routeInfo,
        storageDiagnostics: storageDiags,
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer
      };
    } catch (error) {
      logError(error, 'export_debug_data');
      return {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }
};

/**
 * Extract subdomain from URL for logging
 */
function getSubdomainFromURL(): string | null {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost') {
    return new URLSearchParams(window.location.search).get('subdomain');
  }
  
  const hostParts = hostname.split('.');
  if (hostParts.length > 2) {
    return hostParts[0];
  }
  
  return null;
}


import { supabase } from '@/lib/supabase';
import { recordSessionEvent } from './debugMode';

/**
 * Diagnostic tool to identify auth and routing issues
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
  }> {
    try {
      // Get current session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (!session) {
        console.log("🔍 AuthDebug: No active session");
        return { hasSession: false };
      }
      
      // Extract token information
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = expiresAt ? expiresAt - now : undefined;
      
      // Extract user type
      const userType = session.user?.user_metadata?.user_type;
      
      const result = {
        hasSession: true,
        expiresIn: expiresIn,
        userType,
        tokenInfo: {
          valid: expiresAt ? expiresAt > now : false,
          expiresAt: expiresAt ? new Date(expiresAt * 1000) : undefined
        }
      };
      
      console.log("🔍 AuthDebug: Session state", result);
      return result;
    } catch (error) {
      console.error("🔍 AuthDebug Error:", error);
      recordSessionEvent('auth_debug_error');
      return { hasSession: false };
    }
  },
  
  /**
   * Log detailed routing information
   */
  logRouteInfo(pathname: string, expectedRole?: string) {
    const currentTime = new Date().toISOString();
    
    console.log(`🧭 Route Debug [${currentTime}]:`, {
      currentPath: pathname,
      expectedRole,
      subdomain: getSubdomainFromURL(),
      referrer: document.referrer || 'none'
    });
    
    recordSessionEvent(`route_access_${pathname}`);
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

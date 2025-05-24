
import { supabase } from '@/lib/supabase';

let tokenRefreshInterval: NodeJS.Timeout | null = null;
let isMonitoring = false;

export const startTokenMonitoring = () => {
  if (isMonitoring) return;
  
  isMonitoring = true;
  console.log('Token monitoring started');
  
  // Check token every 5 minutes
  tokenRefreshInterval = setInterval(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Token will auto-refresh if needed
        console.log('Token check completed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }, 5 * 60 * 1000);
};

export const stopTokenMonitoring = () => {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
  isMonitoring = false;
  console.log('Token monitoring stopped');
};

export const refreshToken = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return !!data.session;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

export const ensureValidToken = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found');
      return false;
    }
    
    // Check if token is close to expiry (within 5 minutes)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry < 300) { // Less than 5 minutes
        console.log('Token close to expiry, refreshing...');
        return await refreshToken();
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

export const withFreshToken = async <T>(operation: () => Promise<T>): Promise<T> => {
  const isValid = await ensureValidToken();
  if (!isValid) {
    throw new Error('Unable to ensure valid authentication token');
  }
  
  return await operation();
};


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

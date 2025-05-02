
import { refreshSession } from "@/hooks/useAuthState";
import { toast } from "sonner";

let monitoringIntervalId: number | null = null;
const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Checks if the JWT token is valid and refreshes it if needed
 */
export const checkAndRefreshToken = async (): Promise<{ isValid: boolean; reason?: string }> => {
  try {
    const refreshed = await refreshSession();
    if (refreshed) {
      console.log('JWT token refreshed successfully');
      return { isValid: true };
    }
    return { isValid: false, reason: 'Token refresh failed' };
  } catch (error) {
    console.error('Error refreshing JWT token:', error);
    return { isValid: false, reason: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Start monitoring JWT token and refresh it periodically
 */
export const startJwtMonitoring = () => {
  // Clear any existing interval
  if (monitoringIntervalId) {
    stopJwtMonitoring();
  }
  
  console.log('Starting JWT token monitoring');
  
  // Initial check
  checkAndRefreshToken();
  
  // Set up interval to check periodically
  monitoringIntervalId = window.setInterval(async () => {
    console.log('Performing periodic JWT token check');
    const tokenStatus = await checkAndRefreshToken();
    
    if (!tokenStatus.isValid) {
      toast.warning("Session token could not be refreshed. You may need to login again soon.");
    }
  }, MONITORING_INTERVAL);
};

/**
 * Stop JWT token monitoring
 */
export const stopJwtMonitoring = () => {
  if (monitoringIntervalId) {
    console.log('Stopping JWT token monitoring');
    window.clearInterval(monitoringIntervalId);
    monitoringIntervalId = null;
  }
};

/**
 * Verify if the JWT token is still valid
 */
export const verifyJwtToken = async (): Promise<{ isValid: boolean; reason?: string }> => {
  // This function can be extended to actually verify the token using 
  // the Supabase client or a custom JWT verification function
  return await checkAndRefreshToken();
};

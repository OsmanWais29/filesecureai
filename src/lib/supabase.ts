
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://plxuyxacefgttimodrbp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBseHV5eGFjZWZndHRpbW9kcmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4Mjk1NDksImV4cCI6MjA1NTQwNTU0OX0.2eRYQPoDgbl5Zqyya1YP9SBXlUOhZUP0ptWbGthT8sw';

// Enhanced fetch with JWT token debugging capabilities
const debugFetch = async (...args: Parameters<typeof fetch>) => {
  // Debug URL being requested
  console.debug("[supabase fetch]", args[0]);
  
  // Debug JWT tokens for storage operations
  if (typeof args[0] === 'string' && args[0].includes('/storage/')) {
    const options = args[1] || {};
    const headers = options.headers || {};
    
    // Check if there's an Authorization header with a JWT token
    if (headers.Authorization && typeof headers.Authorization === 'string' && headers.Authorization.startsWith('Bearer ')) {
      const token = headers.Authorization.substring(7);
      try {
        // Decode the JWT payload to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = new Date(payload.exp * 1000);
        const now = new Date();
        const minutesLeft = Math.round((expiryTime.getTime() - now.getTime()) / 60000);
        
        console.debug(
          `[JWT Debug] Token expires in ${minutesLeft} minutes (${expiryTime.toLocaleTimeString()})`,
          minutesLeft < 5 ? '⚠️ TOKEN EXPIRING SOON' : ''
        );
      } catch (e) {
        console.debug("[JWT Debug] Failed to decode token:", e);
      }
    } else if (args[0].includes('/storage/')) {
      console.debug("[JWT Debug] Storage request without Authorization header");
    }
  }
  
  return fetch(...args);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'supabase.auth.token',
  },
  global: {
    fetch: debugFetch,
  },
});

// Utility to check and refresh token if needed before storage operations
export const ensureFreshToken = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    if (!session) {
      console.warn("No session found, authentication required");
      return false;
    }
    
    // Decode token to check expiration
    const token = session.access_token;
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.warn("Malformed JWT token");
      return false;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const expiry = new Date(payload.exp * 1000);
    const now = new Date();
    const minutesLeft = (expiry.getTime() - now.getTime()) / 60000;
    
    // If token expires in less than 5 minutes, refresh it
    if (minutesLeft < 5) {
      console.log(`Token expires soon (${minutesLeft.toFixed(1)} minutes), refreshing...`);
      const { data: refreshData, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Failed to refresh token:", error);
        return false;
      }
      
      console.log("Token refreshed successfully");
    }
    
    return true;
  } catch (error) {
    console.error("Error checking/refreshing token:", error);
    return false;
  }
};

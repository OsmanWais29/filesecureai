
import { createClient } from '@supabase/supabase-js';
import { recordSessionEvent, logAuthEvent } from '@/utils/debugMode';

const supabaseUrl = 'https://plxuyxacefgttimodrbp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBseHV5eGFjZWZndHRpbW9kcmJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4Mjk1NDksImV4cCI6MjA1NTQwNTU0OX0.2eRYQPoDgbl5Zqyya1YP9SBXlUOhZUP0ptWbGthT8sw';

// Enhanced fetch with JWT token debugging capabilities
const debugFetch = async (...args: Parameters<typeof fetch>) => {
  // Debug URL being requested
  const url = args[0] instanceof Request ? args[0].url : String(args[0]);
  recordSessionEvent(`supabase_fetch_${url.includes('/storage/') ? 'storage' : 'api'}`);
  
  // Debug JWT tokens for storage operations
  if (typeof url === 'string' && url.includes('/storage/')) {
    const options = args[1] || {};
    const headers = options.headers || {};
    
    // Check if there's an Authorization header with a JWT token
    // Use type-safe approach for accessing headers
    let authHeader: string | null = null;
    
    if (headers instanceof Headers) {
      authHeader = headers.get('Authorization');
    } else if (Array.isArray(headers)) {
      // Handle headers as array of [key, value] pairs
      const authPair = headers.find(pair => pair[0] === 'Authorization');
      authHeader = authPair ? authPair[1] : null;
    } else if (typeof headers === 'object') {
      // Handle headers as Record<string, string>
      authHeader = (headers as Record<string, string>)['Authorization'] || null;
    }
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Decode the JWT payload to check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = new Date(payload.exp * 1000);
        const now = new Date();
        const minutesLeft = Math.round((expiryTime.getTime() - now.getTime()) / 60000);
        
        logAuthEvent(`JWT Debug: Token expires in ${minutesLeft} minutes (${expiryTime.toLocaleTimeString()})`, 
          minutesLeft < 5 ? '⚠️ TOKEN EXPIRING SOON' : '');
      } catch (e) {
        console.debug("[JWT Debug] Failed to decode token:", e);
      }
    } else if (url.includes('/storage/')) {
      logAuthEvent("[JWT Debug] Storage request without Authorization header");
    }
  }
  
  return fetch(...args);
};

// Create Supabase client with enhanced options
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

// Log when Supabase client is initialized
recordSessionEvent('supabase_client_initialized');

// Re-export token manager functions - fix isTokenValid import
export { 
  ensureValidToken, 
  refreshToken, 
  withFreshToken,
  startTokenMonitoring,
  stopTokenMonitoring
} from '@/utils/jwt/tokenManager';

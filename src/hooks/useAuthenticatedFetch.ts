
import { supabase } from "@/lib/supabase";
import { withFreshToken } from "@/utils/jwt/tokenManager";

// Utility for making authenticated API requests, auto-refreshing tokens if needed
export async function authenticatedFetch(url: string, options: any = {}) {
  return withFreshToken(async () => {
    // Get current session with potentially refreshed token
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
    if (!token) {
      throw new Error("No authenticated session available");
    }
    
    // Create new headers object to avoid TypeScript errors
    const headers = {
      ...options.headers,
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    return fetch(url, {
      ...options,
      headers,
    });
  });
}

// Enhanced utility specifically for storage operations
export async function authenticatedStorageOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  return withFreshToken(operation);
}

// Re-export the token management functions for ease of use
export { ensureValidToken, startTokenMonitoring, stopTokenMonitoring } from "@/utils/jwt/tokenManager";

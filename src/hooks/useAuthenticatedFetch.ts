
import { supabase } from "@/lib/supabase";

// Utility for making authenticated API requests, auto-refreshing tokens if needed
export async function authenticatedFetch(url: string, options: any = {}) {
  // First, ensure we have a fresh token
  await ensureFreshToken();
  
  // Get current session with potentially refreshed token
  let { data } = await supabase.auth.getSession();
  let token = data.session?.access_token;
  
  if (!token) {
    // Try to refresh if no token is available
    const { data: refreshData, error } = await supabase.auth.refreshSession();
    if (error) throw new Error("No authenticated session available");
    token = refreshData.session?.access_token;
    if (!token) throw new Error("No authenticated session available");
  }

  // Always log token expiration for debugging
  if (token) {
    const payload = token.split(".")[1];
    try {
      const decoded = JSON.parse(atob(payload));
      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);
      if (exp - now < 120) {
        // Warn if expiring soon
        console.warn("[authenticatedFetch] JWT expiring soon!", exp - now, "seconds left");
      }
    } catch { }
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
}

// Enhanced utility specifically for storage operations
export async function authenticatedStorageOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    // Ensure we have a fresh token before storage operation
    const isTokenValid = await ensureFreshToken();
    
    if (!isTokenValid) {
      throw new Error("Invalid or expired authentication token");
    }
    
    // Perform the storage operation
    return await operation();
  } catch (error: any) {
    // Handle InvalidJWT errors specifically - checking multiple properties and patterns
    const isJwtError = 
      error?.error === 'InvalidJWT' || 
      (error?.message && (error.message.includes('JWT') || error.message.includes('token'))) || 
      error?.statusCode === 400;
      
    if (isJwtError) {
      console.warn("Storage operation failed with JWT error, attempting recovery...");
      
      // Force a complete session refresh
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !data.session) {
        throw new Error("Failed to refresh authentication. Please log in again.");
      }
      
      // Retry the operation after token refresh
      return await operation();
    }
    
    // Re-throw other errors
    throw error;
  }
}

// Simple helper to ensure token is fresh
export async function ensureFreshToken(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    return !error && !!data.session;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

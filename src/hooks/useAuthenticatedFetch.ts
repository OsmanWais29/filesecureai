
import { supabase } from "@/lib/supabase";
import { refreshSession } from "./useAuthState";

// Utility for making authenticated API requests, auto-refreshing tokens if needed
export async function authenticatedFetch(url: string, options: any = {}) {
  // Try current session first
  let { data } = await supabase.auth.getSession();
  let token = data.session?.access_token;
  if (!token) {
    // Try to refresh
    await refreshSession();
    data = (await supabase.auth.getSession()).data;
    token = data.session?.access_token;
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

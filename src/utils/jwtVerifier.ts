import { supabase } from "@/lib/supabase";
import {
  JWTVerificationResult,
  ReauthenticationResult,
} from "./jwtDiagnosticsTypes";

/**
 * Verifies the current JWT token and provides detailed diagnostics
 */
export async function verifyJwtToken(): Promise<JWTVerificationResult> {
  console.group("🔍 JWT Token Verification");

  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;

    if (!session) {
      console.error("❌ No active session found!");
      console.groupEnd();
      return { isValid: false, reason: "No session available" };
    }

    const token = session.access_token;
    console.log("Token first 20 chars:", token.substring(0, 20) + "...");

    // JWT structure validation
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("❌ Invalid JWT format - token does not have three parts!");
      console.groupEnd();
      return { isValid: false, reason: "Malformed JWT (not 3 parts)" };
    }

    // Decode and analyze payload
    try {
      // Standard base64 URL decode
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      // Check expiration
      const expiryTime = new Date(payload.exp * 1000);
      const currentTime = new Date();
      const timeRemaining = (expiryTime.getTime() - currentTime.getTime()) / 1000;

      console.log("Token subject:", payload.sub || "Not specified");
      console.log("Token audience:", payload.aud || "Not specified");
      console.log("Token expires at:", expiryTime.toISOString());
      console.log("Current time:", currentTime.toISOString());
      console.log(
        `Time remaining: ${timeRemaining.toFixed(0)} seconds (${(
          timeRemaining / 60
        ).toFixed(1)} minutes)`
      );

      if (!payload.sub) {
        console.warn("⚠️ Token missing 'sub' claim");
      }
      if (!payload.aud) {
        console.warn("⚠️ Token missing 'aud' claim");
      }

      // Check for expiration
      if (currentTime > expiryTime) {
        console.error("❌ Token is EXPIRED!");
        console.groupEnd();
        return {
          isValid: false,
          reason: "Token expired",
          expiresAt: expiryTime,
          currentTime,
          payload,
        };
      }

      // Warn about imminent expiration
      if (timeRemaining < 60) {
        console.warn("⚠️ Token expires in less than 1 minute!");
      } else if (timeRemaining < 300) {
        console.warn("⚠️ Token expires in less than 5 minutes!");
      }

      console.log("✅ JWT basic structure and expiration verified");
      console.groupEnd();
      return {
        isValid: true,
        timeRemaining,
        expiresAt: expiryTime,
        payload,
      };
    } catch (e) {
      console.error("❌ Error decoding token payload:", e);
      console.groupEnd();
      return { isValid: false, reason: "Token payload decode error", error: e };
    }
  } catch (error) {
    console.error("❌ Error accessing session:", error);
    console.groupEnd();
    return { isValid: false, reason: "Error accessing session", error };
  }
}

/**
 * Reset authentication and perform a complete re-authentication.
 * NOTE: Requires user credentials.
 */
export async function completeReauthentication(
  email: string,
  password: string
): Promise<ReauthenticationResult> {
  console.group("🔄 Complete Re-authentication");

  try {
    // Sign out completely
    console.log("Signing out...");
    await supabase.auth.signOut({ scope: "global" });

    console.log("Attempting to sign back in...");

    // Sign back in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Failed to sign in:", error);
      console.groupEnd();
      return { success: false, error };
    }

    console.log("✅ Re-authenticated successfully");
    console.log(
      "New session expiry:",
      new Date(data.session?.expires_at || 0).toISOString()
    );

    console.groupEnd();
    return {
      success: true,
      session: data.session,
    };
  } catch (error) {
    console.error("❌ Error during re-authentication:", error);
    console.groupEnd();
    return { success: false, error };
  }
}

/**
 * Refreshes the current JWT token if it's expiring within the specified minutes threshold.
 */
export async function refreshTokenIfNeeded(
  minValidMinutes: number = 10
): Promise<{ refreshed: boolean; success: boolean; message: string }> {
  const verificationResult = await verifyJwtToken();
  if (!verificationResult.isValid || !verificationResult.expiresAt) {
    return {
      refreshed: false,
      success: false,
      message: `Cannot refresh invalid token: ${verificationResult.reason || verificationResult.error || "Unknown error"}`,
    };
  }

  const now = new Date();
  const expiresInMinutes = Math.round((verificationResult.expiresAt.getTime() - now.getTime()) / 60000);

  if (expiresInMinutes < minValidMinutes) {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        return {
          refreshed: true,
          success: false,
          message: `Failed to refresh token: ${error.message}`,
        };
      }
      return {
        refreshed: true,
        success: true,
        message: `Token refreshed successfully, now valid for ${
          data.session ? Math.round((new Date(data.session.expires_at * 1000).getTime() - Date.now()) / 60000) : "unknown"
        } minutes`,
      };
    } catch (err) {
      return {
        refreshed: true,
        success: false,
        message: `Exception during token refresh: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  return {
    refreshed: false,
    success: true,
    message: `Token is still valid for ${expiresInMinutes} minutes, no refresh needed`,
  };
}

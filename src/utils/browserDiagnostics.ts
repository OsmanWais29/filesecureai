
import { BrowserStorageResult } from "./jwtDiagnosticsTypes";

/**
 * Check browser storage for issues with Supabase tokens
 */
export function checkBrowserStorage(): BrowserStorageResult {
  console.group("🗄️ Checking Browser Storage");

  try {
    // Check localStorage
    console.log("Checking localStorage...");

    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(
      (k) => k.includes("supabase") || k.includes("sb-") || k.includes("auth")
    );

    if (supabaseKeys.length === 0) {
      console.warn("⚠️ No Supabase-related keys found in localStorage!");
    } else {
      console.log(`Found ${supabaseKeys.length} Supabase-related keys in localStorage:`);
      for (const key of supabaseKeys) {
        try {
          const value = localStorage.getItem(key);
          try {
            const parsed = JSON.parse(value || "{}");
            console.log(
              `- ${key}: valid JSON ${
                parsed.expires_at
                  ? `, expires: ${new Date(parsed.expires_at).toISOString()}`
                  : ""
              }`
            );
          } catch (e) {
            console.log(`- ${key}: Not JSON or invalid format`);
          }
        } catch (e) {
          console.error(`❌ Error accessing key ${key}:`, e);
        }
      }
    }

    // Check sessionStorage
    console.log("Checking sessionStorage...");

    const sessionKeys = Object.keys(sessionStorage);
    const supabaseSessionKeys = sessionKeys.filter(
      (k) => k.includes("supabase") || k.includes("sb-") || k.includes("auth")
    );

    if (supabaseSessionKeys.length === 0) {
      console.log("No Supabase-related keys found in sessionStorage");
    } else {
      console.log(
        `Found ${supabaseSessionKeys.length} Supabase-related keys in sessionStorage`
      );
    }

    console.log("✅ Browser storage check completed");
    console.groupEnd();

    return {
      localStorage: {
        keys: supabaseKeys,
        count: supabaseKeys.length,
      },
      sessionStorage: {
        keys: supabaseSessionKeys,
        count: supabaseSessionKeys.length,
      },
    };
  } catch (e) {
    console.error("❌ Error checking browser storage:", e);
    console.groupEnd();
    return { error: e };
  }
}


/**
 * JWT Diagnostics Utility
 * This utility provides comprehensive diagnostics for JWT-related issues,
 * particularly for Supabase storage operations.
 */
import { supabase } from "@/lib/supabase";

/**
 * Verifies the current JWT token and provides detailed diagnostics
 */
export async function verifyJwtToken() {
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
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("❌ Invalid JWT format - token does not have three parts!");
      console.groupEnd();
      return { isValid: false, reason: "Malformed JWT (not 3 parts)" };
    }
    
    // Decode and analyze payload
    try {
      // Standard base64 URL decode
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''));

      const payload = JSON.parse(jsonPayload);
      
      // Check expiration
      const expiryTime = new Date(payload.exp * 1000);
      const currentTime = new Date();
      const timeRemaining = (expiryTime.getTime() - currentTime.getTime()) / 1000;
      
      console.log("Token subject:", payload.sub || "Not specified");
      console.log("Token audience:", payload.aud || "Not specified");
      console.log("Token expires at:", expiryTime.toISOString());
      console.log("Current time:", currentTime.toISOString());
      console.log(`Time remaining: ${timeRemaining.toFixed(0)} seconds (${(timeRemaining / 60).toFixed(1)} minutes)`);
      
      // Check basic claims
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
          payload 
        };
      }
      
      // Check if token is about to expire
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
        payload
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
 * Test if direct API upload works, bypassing the Supabase client
 */
export async function testDirectUpload(
  file: File,
  bucket: string = 'secure_documents',
  filePath: string = `test-${Date.now()}.txt`
) {
  console.group("🧪 Testing Direct Upload");
  
  try {
    // Get current session
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    if (!session) {
      console.error("❌ No session for direct upload test");
      console.groupEnd();
      return { success: false, error: "Not authenticated" };
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Get Supabase URL
    const supabaseUrl = "https://plxuyxacefgttimodrbp.supabase.co";
    
    // Log request details
    console.log("Making direct upload request to:", 
      `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`);
    console.log("Using token starting with:", session.access_token.substring(0, 10) + "...");
    
    // Build the URL with upsert parameter
    const url = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}?upsert=true`;
    
    // Make direct upload request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });
    
    // Parse response
    let responseData;
    const responseText = await response.text();
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    console.log("Direct upload response status:", response.status);
    console.log("Direct upload response:", responseData);
    
    const success = response.status >= 200 && response.status < 300;
    
    if (success) {
      console.log("✅ Direct upload succeeded!");
    } else {
      console.error("❌ Direct upload failed!");
    }
    
    console.groupEnd();
    return { 
      success, 
      response,
      status: response.status, 
      data: responseData 
    };
  } catch (error) {
    console.error("❌ Direct upload test error:", error);
    console.groupEnd();
    return { success: false, error };
  }
}

/**
 * Test storage permissions to see if the user can access buckets and list files
 */
export async function testStoragePermissions(bucket: string = 'secure_documents') {
  console.group("🔐 Testing Storage Permissions");
  
  try {
    // 1. List buckets (requires lower-level permissions)
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error("❌ Cannot list buckets:", bucketsError);
    } else {
      console.log("✅ Can list buckets:", buckets.map(b => b.name).join(', '));
      
      // 2. Try to list files in the target bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket)
        .list();
        
      if (filesError) {
        console.error(`❌ Cannot list files in bucket ${bucket}:`, filesError);
      } else {
        console.log(`✅ Can list files in bucket ${bucket}:`, 
          files.length > 0 ? `${files.length} files found` : "Bucket is empty");
      }
    }
    
    console.groupEnd();
    return { 
      canListBuckets: !bucketsError,
      buckets: buckets || [],
      canListFiles: !bucketsError && !files?.error,
      files: files || []
    };
  } catch (error) {
    console.error("❌ Error testing storage permissions:", error);
    console.groupEnd();
    return { 
      canListBuckets: false, 
      canListFiles: false,
      error 
    };
  }
}

/**
 * Check browser storage for issues with Supabase tokens
 */
export function checkBrowserStorage() {
  console.group("🗄️ Checking Browser Storage");
  
  try {
    // Check localStorage
    console.log("Checking localStorage...");
    
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(k => 
      k.includes('supabase') || 
      k.includes('sb-') ||
      k.includes('auth'));
    
    if (supabaseKeys.length === 0) {
      console.warn("⚠️ No Supabase-related keys found in localStorage!");
    } else {
      console.log(`Found ${supabaseKeys.length} Supabase-related keys in localStorage:`);
      
      for (const key of supabaseKeys) {
        try {
          const value = localStorage.getItem(key);
          try {
            const parsed = JSON.parse(value || '{}');
            console.log(`- ${key}: valid JSON ${
              parsed.expires_at 
                ? `, expires: ${new Date(parsed.expires_at).toISOString()}` 
                : ''
            }`);
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
    const supabaseSessionKeys = sessionKeys.filter(k => 
      k.includes('supabase') || 
      k.includes('sb-') ||
      k.includes('auth'));
    
    if (supabaseSessionKeys.length === 0) {
      console.log("No Supabase-related keys found in sessionStorage");
    } else {
      console.log(`Found ${supabaseSessionKeys.length} Supabase-related keys in sessionStorage`);
    }
    
    console.log("✅ Browser storage check completed");
    console.groupEnd();
    
    return {
      localStorage: {
        keys: supabaseKeys,
        count: supabaseKeys.length
      },
      sessionStorage: {
        keys: supabaseSessionKeys,
        count: supabaseSessionKeys.length
      }
    };
  } catch (e) {
    console.error("❌ Error checking browser storage:", e);
    console.groupEnd();
    return { error: e };
  }
}

/**
 * Reset authentication and perform a complete re-authentication
 * NOTE: Requires user credentials
 */
export async function completeReauthentication(email: string, password: string) {
  console.group("🔄 Complete Re-authentication");
  
  try {
    // Sign out completely
    console.log("Signing out...");
    await supabase.auth.signOut({ scope: 'global' });
    
    console.log("Attempting to sign back in...");
    
    // Sign back in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("❌ Failed to sign in:", error);
      console.groupEnd();
      return { success: false, error };
    }
    
    console.log("✅ Re-authenticated successfully");
    console.log("New session expiry:", new Date(data.session?.expires_at || 0).toISOString());
    
    console.groupEnd();
    return { 
      success: true, 
      session: data.session
    };
  } catch (error) {
    console.error("❌ Error during re-authentication:", error);
    console.groupEnd();
    return { success: false, error };
  }
}

/**
 * Run a full diagnostic suite on JWT and storage functionality
 */
export async function runFullDiagnostics(testFile?: File) {
  console.group("🔬 Running Full JWT & Storage Diagnostics");
  
  const results = {
    jwtVerification: null as any,
    storagePermissions: null as any,
    browserStorage: null as any,
    directUpload: null as any
  };
  
  // 1. JWT verification
  console.log("Step 1: Verifying JWT token...");
  results.jwtVerification = await verifyJwtToken();
  
  // 2. Test storage permissions
  console.log("Step 2: Testing storage permissions...");
  results.storagePermissions = await testStoragePermissions();
  
  // 3. Check browser storage
  console.log("Step 3: Checking browser storage...");
  results.browserStorage = checkBrowserStorage();
  
  // 4. Test direct upload if a file is provided
  if (testFile) {
    console.log("Step 4: Testing direct file upload...");
    results.directUpload = await testDirectUpload(testFile);
  } else {
    console.log("Skipping direct upload test (no test file provided)");
  }
  
  console.log("✅ Diagnostics complete!");
  console.groupEnd();
  
  return results;
}

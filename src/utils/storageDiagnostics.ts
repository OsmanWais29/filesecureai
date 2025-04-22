
import { supabase } from "@/lib/supabase";
import {
  DirectUploadResult,
  StoragePermissionsResult,
  FullDiagnosticsResult,
} from "./jwtDiagnosticsTypes";
import { verifyJwtToken } from "./jwtVerifier";
import { checkBrowserStorage } from "./browserDiagnostics";

/**
 * Test if direct API upload works, bypassing the Supabase client
 */
export async function testDirectUpload(
  file: File,
  bucket: string = "secure_documents",
  filePath: string = `test-${Date.now()}.txt`
): Promise<DirectUploadResult> {
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
    formData.append("file", file);

    // Get Supabase URL
    const supabaseUrl = "https://plxuyxacefgttimodrbp.supabase.co";

    // Log request details
    console.log(
      "Making direct upload request to:",
      `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}`
    );
    console.log(
      "Using token starting with:",
      session.access_token.substring(0, 10) + "..."
    );

    // Build the URL with upsert parameter
    const url = `${supabaseUrl}/storage/v1/object/${bucket}/${filePath}?upsert=true`;

    // Make direct upload request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

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
      data: responseData,
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
export async function testStoragePermissions(
  bucket: string = "secure_documents"
): Promise<StoragePermissionsResult> {
  console.group("🔐 Testing Storage Permissions");

  try {
    // 1. List buckets (requires lower-level permissions)
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Cannot list buckets:", bucketsError);
      console.groupEnd();
      return {
        canListBuckets: false,
        error: bucketsError,
      };
    }

    console.log("✅ Can list buckets:", buckets.map((b) => b.name).join(", "));

    // 2. Try to list files in the target bucket
    const { data: filesList, error: filesError } = await supabase.storage
      .from(bucket)
      .list();

    if (filesError) {
      console.error(`❌ Cannot list files in bucket ${bucket}:`, filesError);
      console.groupEnd();
      return {
        canListBuckets: true,
        buckets: buckets || [],
        canListFiles: false,
        error: filesError,
      };
    }

    console.log(
      `✅ Can list files in bucket ${bucket}:`,
      filesList?.length > 0 ? `${filesList.length} files found` : "Bucket is empty"
    );

    console.groupEnd();
    return {
      canListBuckets: true,
      buckets: buckets || [],
      canListFiles: true,
      files: filesList || [],
    };
  } catch (error) {
    console.error("❌ Error testing storage permissions:", error);
    console.groupEnd();
    return {
      canListBuckets: false,
      canListFiles: false,
      error,
    };
  }
}

/**
 * Run a full diagnostic suite on JWT and storage functionality
 */
export async function runFullDiagnostics(
  testFile?: File
): Promise<FullDiagnosticsResult> {
  console.group("🔬 Running Full JWT & Storage Diagnostics");

  const results: FullDiagnosticsResult = {
    jwtVerification: { isValid: false },
    storagePermissions: { canListBuckets: false },
    browserStorage: {},
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

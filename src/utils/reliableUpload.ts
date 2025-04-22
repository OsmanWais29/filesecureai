
import { supabase } from "@/lib/supabase";
import { verifyJwtToken } from "./jwtVerifier";
import { testDirectUpload } from "./storageDiagnostics";
import { FileUploadResult } from "./jwtDiagnosticsTypes";

// Type guard to check for detailed error properties
function hasErrorDetails(error: any): error is { message: string, error?: string, statusCode?: number } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export async function reliableUpload(
  bucket: string,
  path: string,
  file: File,
  options: { maxRetries?: number; runDiagnostics?: boolean } = {}
): Promise<FileUploadResult> {
  const maxRetries = options.maxRetries ?? 3;
  let lastError: any = null;

  // Diagnostics step: Optionally check JWT before upload.
  if (options.runDiagnostics) {
    const tokenDiag = await verifyJwtToken();
    if (!tokenDiag.isValid) {
      return {
        success: false,
        method: "diagnostics-precheck",
        error: tokenDiag.reason || tokenDiag.error,
      };
    }
  }

  // Try normal upload first (with retry for transient network issues)
  for (let attempt = 1; attempt <= maxRetries; ++attempt) {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (!error) {
      return {
        success: true,
        method: attempt === 1 ? "standard" : `standard-retry-${attempt}`,
        data,
      };
    }

    lastError = error;
    // Only retry on likely transient issues (network, 5XX)
    if (!(error.message?.includes('5'))) break;
  }

  // Check for JWT-related error using a type guard and message-based detection
  const isJwtError = hasErrorDetails(lastError) && (
    lastError.message?.toLowerCase().includes('jwt') ||
    lastError.message?.toLowerCase().includes('token') ||
    lastError.message?.toLowerCase().includes('auth') ||
    lastError.error === 'InvalidJWT' ||
    lastError.statusCode === 400
  );

  if (isJwtError) {
    // Attempt token refresh and one more upload
    const { data: sessData, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && sessData?.session) {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (!error) {
        return {
          success: true,
          method: "refresh-and-retry",
          data,
        };
      }
      lastError = error;
    }

    // Try direct upload fallback
    const directResult = await testDirectUpload(file, bucket, path);
    if (directResult.success) {
      return {
        success: true,
        method: "direct-upload-fallback",
        data: directResult.data,
      };
    }
    lastError = directResult.error;
  }

  // All attempts failed
  return {
    success: false,
    method: "all-failed",
    error: {
      originalError: lastError,
      message: "Upload failed after all recovery attempts",
    },
  };
}

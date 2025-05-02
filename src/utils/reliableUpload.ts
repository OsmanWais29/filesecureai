
// Refactored: src/utils/reliableUpload.ts

import { supabase } from "@/lib/supabase";
import { maybeRunDiagnostics, refreshJwt } from "./jwtUploadDiagnostics";
import { uploadViaSignedUrl } from "./signedUrlUploader";
import { tryStandardUpload } from "./standardUploader";
import { handleDirectUploadFallback } from "./fallbackUploader";
import { FileUploadResult } from "./jwtDiagnosticsTypes";
import { checkAndRefreshToken } from "./jwtMonitoring";

function hasErrorDetails(error: any): error is { message: string, error?: string, statusCode?: number } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

/**
 * Orchestrates a reliable upload sequence with modular helpers
 */
export async function reliableUpload(
  bucket: string,
  path: string,
  file: File,
  options: { maxRetries?: number; runDiagnostics?: boolean; forceMethod?: "POST" | "PUT" } = {}
): Promise<FileUploadResult> {
  console.log(`Starting upload for ${file.name} to ${bucket}/${path}`);
  const maxRetries = options.maxRetries ?? 3;
  const isPdf = file.type === 'application/pdf';
  const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB

  // Stage 1: Pre-upload JWT refresh for all files
  console.log("Stage 1: Refreshing authentication token");
  await checkAndRefreshToken();

  // Stage 2: Pre-upload diagnostics (may refresh token for PDF)
  console.log("Stage 2: Running pre-upload diagnostics");
  const diagResult = await maybeRunDiagnostics(file, options.runDiagnostics);
  if (!diagResult.valid) {
    if (options.runDiagnostics && !isPdf) {
      console.error("Pre-upload diagnostics failed:", diagResult.reason);
      return { success: false, method: "diagnostics-precheck", error: diagResult.reason };
    }
  }

  // Stage 3: Special: signed URL for large PDFs
  if (isPdf && isLargeFile) {
    console.log("Stage 3: Using signed URL for large PDF file");
    const signedUrlResult = await uploadViaSignedUrl(bucket, path, file);
    if (signedUrlResult.success) {
      console.log("Upload completed successfully via signed URL");
      return signedUrlResult;
    }
    console.warn("Signed URL upload failed, falling back to standard upload");
  } else {
    console.log("Stage 3: Standard upload path (not a large PDF)");
  }

  // Stage 4: Standard upload (with retry)
  console.log("Stage 4: Attempting standard upload with retries");
  const { result: stdResult, lastError } = await tryStandardUpload(bucket, path, file, isPdf, maxRetries);
  if (stdResult.success) {
    console.log("Upload completed successfully via standard upload");
    return stdResult;
  }
  console.warn("Standard upload failed after retries:", lastError);

  // Stage 5: JWT-related error detect (Type guard)
  console.log("Stage 5: Checking for JWT-related errors");
  const isJwtError = hasErrorDetails(lastError) && (
    lastError.message?.toLowerCase().includes('jwt') ||
    lastError.message?.toLowerCase().includes('token') ||
    lastError.message?.toLowerCase().includes('auth') ||
    lastError.error === 'InvalidJWT' ||
    lastError.statusCode === 400
  );
  
  if (isJwtError) {
    // Stage 6: Try more aggressive token refresh
    console.log("Stage 6: JWT error detected, performing aggressive token refresh");
    await refreshJwt(true);
    await checkAndRefreshToken();
    
    // Stage 7: Try standard upload again with fresh token
    console.log("Stage 7: Retrying standard upload with fresh token");
    const { result: stdResultRetry } = await tryStandardUpload(bucket, path, file, isPdf, 1);
    if (stdResultRetry.success) {
      console.log("Upload successful after token refresh");
      return stdResultRetry;
    }

    // Stage 8: If still failing, use direct upload fallback
    if (isPdf || options.forceMethod) {
      console.log("Stage 8: Using direct upload fallback method");
      const fallbackResult = await handleDirectUploadFallback(file, bucket, path);
      if (fallbackResult.success) {
        console.log("Upload completed successfully via direct fallback");
        return fallbackResult;
      }
      console.error("Direct fallback upload also failed");
      return fallbackResult;
    }
  } else {
    console.log("Error not JWT-related, cannot use token refresh path");
  }

  // All attempts failed
  console.error("All upload methods failed");
  return {
    success: false,
    method: "all-failed",
    error: {
      originalError: lastError,
      message: isPdf 
        ? "PDF upload failed after all recovery attempts" 
        : "Upload failed after all recovery attempts",
    },
  };
}

/**
 * Wrapped utility for PDF uploads
 */
export async function uploadPdfReliably(bucket: string, path: string, pdfFile: File): Promise<{ success: boolean; url?: string; error?: any }> {
  console.group('PDF Upload Process');
  try {
    if (pdfFile.type !== 'application/pdf') throw new Error('Not a PDF file');
    
    // Ensure we have a fresh token before uploading
    await checkAndRefreshToken();
    console.log("Starting PDF upload with fresh token");
    
    const result = await reliableUpload(bucket, path, pdfFile, {
      maxRetries: 3,
      runDiagnostics: true,
      forceMethod: pdfFile.size > 5 * 1024 * 1024 ? "PUT" : "POST"
    });
    
    if (!result.success) {
      console.error("PDF upload failed:", result.error);
      throw new Error(typeof result.error === 'object' ? result.error.message || JSON.stringify(result.error) : String(result.error));
    }
    
    // Force token refresh before getting URL
    await checkAndRefreshToken();
    console.log("Getting public URL for uploaded PDF");
    
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path);
    console.log('Upload complete:', publicUrl);
    console.groupEnd();
    return { success: true, url: publicUrl?.publicUrl };
  } catch (error) {
    console.error('PDF upload failed:', error);
    console.groupEnd();
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}


// Refactored: src/utils/reliableUpload.ts

import { supabase } from "@/lib/supabase";
import { maybeRunDiagnostics, refreshJwt } from "./jwtUploadDiagnostics";
import { uploadViaSignedUrl } from "./signedUrlUploader";
import { tryStandardUpload } from "./standardUploader";
import { handleDirectUploadFallback } from "./fallbackUploader";
import { FileUploadResult } from "./jwtDiagnosticsTypes";

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
  const maxRetries = options.maxRetries ?? 3;
  const isPdf = file.type === 'application/pdf';
  const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB

  // Pre-upload diagnostics (may refresh token for PDF)
  const diagResult = await maybeRunDiagnostics(file, options.runDiagnostics);
  if (!diagResult.valid) {
    if (options.runDiagnostics && !isPdf) {
      return { success: false, method: "diagnostics-precheck", error: diagResult.reason };
    }
  }

  // Special: signed URL for large PDFs
  if (isPdf && isLargeFile) {
    const signedUrlResult = await uploadViaSignedUrl(bucket, path, file);
    if (signedUrlResult.success) return signedUrlResult;
  }

  // Standard upload (with retry)
  const { result: stdResult, lastError } = await tryStandardUpload(bucket, path, file, isPdf, maxRetries);
  if (stdResult.success) return stdResult;

  // JWT-related error detect (Type guard)
  const isJwtError = hasErrorDetails(lastError) && (
    lastError.message?.toLowerCase().includes('jwt') ||
    lastError.message?.toLowerCase().includes('token') ||
    lastError.message?.toLowerCase().includes('auth') ||
    lastError.error === 'InvalidJWT' ||
    lastError.statusCode === 400
  );
  if (isJwtError) {
    await refreshJwt();
    const { result: stdResultRetry } = await tryStandardUpload(bucket, path, file, isPdf, 1);
    if (stdResultRetry.success) return stdResultRetry;

    if (isPdf || options.forceMethod) {
      const fallbackResult = await handleDirectUploadFallback(file, bucket, path);
      if (fallbackResult.success) return fallbackResult;
      return fallbackResult;
    }
  }

  // All attempts failed
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
    const result = await reliableUpload(bucket, path, pdfFile, {
      maxRetries: 3,
      runDiagnostics: true,
      forceMethod: pdfFile.size > 5 * 1024 * 1024 ? "PUT" : "POST"
    });
    if (!result.success) throw new Error(typeof result.error === 'object' ? result.error.message || JSON.stringify(result.error) : String(result.error));
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

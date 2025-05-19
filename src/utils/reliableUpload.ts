
import { supabase } from "@/lib/supabase";
import { logAuthEvent, recordSessionEvent } from "./debugMode";
import { testDirectUpload } from "./storageDiagnostics";

/**
 * Reliable file upload that falls back to direct upload if standard upload fails
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path The path within the bucket
 * @param options Upload options
 */
export const reliableUpload = async (
  file: File,
  bucket: string,
  path: string,
  options: {
    upsert?: boolean;
    cacheControl?: string;
    retries?: number;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<{
  success: boolean;
  data?: any;
  error?: any;
  method: 'standard' | 'direct';
}> => {
  const { upsert = true, retries = 2, onProgress, cacheControl } = options;
  let attempt = 0;
  let lastError = null;
  
  recordSessionEvent(`reliable_upload_start_${bucket}`);
  
  // First try standard upload method
  while (attempt < retries) {
    try {
      attempt++;
      
      // Standard upload via Supabase SDK
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(path, file, { 
          upsert, 
          cacheControl
        });
      
      if (error) {
        lastError = error;
        logAuthEvent(`Standard upload failed (attempt ${attempt}): ${error.message}`);
        // Continue to next retry or fallback
      } else {
        // Success!
        recordSessionEvent(`reliable_upload_success_standard_${bucket}`);
        return {
          success: true,
          data,
          method: 'standard'
        };
      }
    } catch (err) {
      lastError = err;
      logAuthEvent(`Standard upload exception (attempt ${attempt}): ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  
  // If we're here, standard upload failed after all retries
  // Fall back to direct upload method
  try {
    logAuthEvent(`Falling back to direct upload for ${path}`);
    
    const directResult = await testDirectUpload(file, bucket, path);
    
    if (directResult.success) {
      recordSessionEvent(`reliable_upload_success_direct_${bucket}`);
      return {
        success: true,
        data: directResult.data,
        method: 'direct'
      };
    } else {
      recordSessionEvent(`reliable_upload_fail_${bucket}`);
      return {
        success: false,
        error: directResult.error,
        method: 'direct'
      };
    }
  } catch (directErr) {
    logAuthEvent(`Direct upload failed: ${directErr instanceof Error ? directErr.message : String(directErr)}`);
    recordSessionEvent(`reliable_upload_fail_${bucket}`);
    
    return {
      success: false,
      error: directErr || lastError,
      method: 'direct'
    };
  }
};

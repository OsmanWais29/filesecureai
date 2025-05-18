
import { supabase } from "@/lib/supabase";
import { withFreshToken } from "./jwt/tokenManager";
import { logAuthEvent, recordSessionEvent } from "./debugMode";

interface UploadOptions {
  bucketName: string;
  filePath: string;
  file: File | Blob;
  onProgress?: (progress: number) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
  retries?: number;
}

/**
 * Reliable upload with automatic retry and token refresh
 */
export const reliableUpload = async ({
  bucketName,
  filePath,
  file,
  onProgress,
  maxRetries = 3,
  retryDelay = 1000
}: UploadOptions): Promise<UploadResult> => {
  let retries = 0;
  
  // Function to attempt upload
  const attemptUpload = async (): Promise<UploadResult> => {
    try {
      // Ensure we have a valid token before uploading
      return await withFreshToken(async () => {
        recordSessionEvent(`upload_attempt_${bucketName}_try_${retries + 1}`);
        
        // Perform the upload with Supabase storage
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .upload(filePath, file, { upsert: true });
        
        if (error) {
          logAuthEvent(`Upload failed (attempt ${retries + 1}): ${error.message}`);
          
          // Check if we should retry
          if (retries < maxRetries) {
            retries++;
            logAuthEvent(`Retrying upload in ${retryDelay}ms (attempt ${retries} of ${maxRetries})`);
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            
            // Exponential backoff for subsequent retries
            return attemptUpload();
          }
          
          recordSessionEvent(`upload_failed_after_${retries}_retries`);
          return {
            success: false,
            error: error.message,
            retries
          };
        }
        
        logAuthEvent(`Upload successful: ${filePath}`);
        recordSessionEvent(`upload_success_${bucketName}`);
        
        return {
          success: true,
          path: data?.path,
          retries
        };
      });
    } catch (error) {
      logAuthEvent(`Upload threw exception: ${error instanceof Error ? error.message : String(error)}`);
      
      // Check if we should retry
      if (retries < maxRetries) {
        retries++;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Exponential backoff for subsequent retries
        return attemptUpload();
      }
      
      recordSessionEvent(`upload_exception_after_${retries}_retries`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        retries
      };
    }
  };
  
  // Start the upload process
  return attemptUpload();
};

/**
 * Get a public URL for a file, with token refresh
 */
export const getPublicUrl = async (bucketName: string, filePath: string): Promise<string> => {
  try {
    return await withFreshToken(async () => {
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      return data.publicUrl;
    });
  } catch (error) {
    logAuthEvent(`Failed to get public URL: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

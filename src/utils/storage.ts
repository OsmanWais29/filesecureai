
import { supabase, ensureFreshToken } from "@/lib/supabase";
import { authenticatedStorageOperation } from "@/hooks/useAuthenticatedFetch";

// Define an extended StorageError type to handle potential properties
interface ExtendedStorageError {
  message: string;
  statusCode?: number;
  error?: string;
}

/**
 * Uploads a file to Supabase storage with comprehensive JWT error handling
 */
export async function uploadFile(
  file: File,
  bucket: string,
  filePath: string,
  options: { contentType?: string; upsert?: boolean } = {}
) {
  return authenticatedStorageOperation(async () => {
    // Try to upload with the standard Supabase client
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: options.upsert ?? true,
        contentType: options.contentType || file.type,
      });
    
    if (error) {
      console.error("Storage upload error:", error);
      
      // If we still get an error that looks like a JWT issue, try direct upload
      // Use type-safe error handling to check for JWT-related errors
      const storageError = error as ExtendedStorageError;
      const isJwtError = 
        storageError.message?.includes('JWT') || 
        storageError.message?.includes('token') ||
        storageError?.statusCode === 400 || 
        storageError?.error === 'InvalidJWT';
        
      if (isJwtError) {
        console.log("Attempting direct upload as fallback strategy");
        return directStorageUpload(file, bucket, filePath, options);
      }
      
      throw error;
    }
    
    return data;
  });
}

/**
 * Fallback direct upload method when standard Supabase client fails
 */
async function directStorageUpload(
  file: File,
  bucket: string,
  filePath: string,
  options: { contentType?: string; upsert?: boolean } = {}
) {
  // Ensure fresh token
  await ensureFreshToken();
  
  // Get fresh session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("No authenticated session available");
  }
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  
  // Create URL query parameters
  const queryParams = new URLSearchParams();
  if (options.upsert !== false) {
    queryParams.append('upsert', 'true');
  }
  
  // Make direct call to storage API
  const response = await fetch(
    `https://plxuyxacefgttimodrbp.supabase.co/storage/v1/object/${bucket}/${filePath}?${queryParams.toString()}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        // No Content-Type header - it will be set by the browser for multipart/form-data
      },
      body: formData
    }
  );
  
  if (!response.ok) {
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    throw new Error(`Upload failed: ${response.status} ${responseData?.message || responseText}`);
  }
  
  // Parse and return response data
  const responseData = await response.json();
  return responseData;
}

/**
 * Downloads a file from storage with comprehensive error handling
 */
export async function downloadFile(bucket: string, filePath: string) {
  return authenticatedStorageOperation(async () => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);
    
    if (error) {
      throw error;
    }
    
    return data;
  });
}

/**
 * Gets a public URL for a file with error handling
 */
export async function getFileUrl(bucket: string, filePath: string) {
  try {
    // Ensure fresh token first (for private buckets)
    await ensureFreshToken();
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
}

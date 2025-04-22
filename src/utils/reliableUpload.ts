
import { supabase } from "@/lib/supabase";
import { verifyJwtToken } from "./jwtVerifier";
import { testDirectUpload } from "./storageDiagnostics";
import { FileUploadResult } from "./jwtDiagnosticsTypes";

// Type guard to check for detailed error properties
function hasErrorDetails(error: any): error is { message: string, error?: string, statusCode?: number } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

/**
 * Enhanced reliable upload function with special handling for PDFs and robust JWT error recovery
 */
export async function reliableUpload(
  bucket: string,
  path: string,
  file: File,
  options: { maxRetries?: number; runDiagnostics?: boolean; forceMethod?: "POST" | "PUT" } = {}
): Promise<FileUploadResult> {
  const maxRetries = options.maxRetries ?? 3;
  let lastError: any = null;
  const isPdf = file.type === 'application/pdf';
  const isLargeFile = file.size > 5 * 1024 * 1024; // 5MB threshold

  console.log(`Starting upload: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB), type: ${file.type}`);
  
  // Diagnostics step: Optionally check JWT before upload.
  if (options.runDiagnostics || isPdf) {
    const tokenDiag = await verifyJwtToken();
    if (!tokenDiag.isValid) {
      console.warn(`JWT validation failed before upload: ${tokenDiag.reason}`);
      
      // For PDFs, always try to refresh token before upload
      if (isPdf) {
        console.log("PDF detected, refreshing token before upload attempt");
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Failed to refresh token before PDF upload:", error.message);
        } else {
          console.log("Token refreshed successfully before PDF upload");
        }
      } else if (options.runDiagnostics) {
        return {
          success: false,
          method: "diagnostics-precheck",
          error: tokenDiag.reason || tokenDiag.error,
        };
      }
    }
  }

  // Special handling for large PDFs
  if (isPdf && isLargeFile) {
    console.log("Large PDF detected, using signed URL approach");
    try {
      // Create signed URL for large PDF upload
      const { data, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);
        
      if (urlError) {
        console.error("Failed to generate signed URL:", urlError);
      } else if (data) {
        // Use the signed URL with PUT method
        const response = await fetch(data.signedUrl, {  // ✅ Fixed property name
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': 'application/pdf'
          }
        });
        
        if (response.ok) {
          console.log("Large PDF upload successful via signed URL");
          return {
            success: true,
            method: "signed-url-pdf",
            data: { path }
          };
        } else {
          const errorText = await response.text();
          console.error(`Signed URL upload failed with status ${response.status}:`, errorText);
          lastError = { message: errorText, status: response.status };
        }
      }
    } catch (error) {
      console.error("Error in signed URL upload:", error);
      lastError = error;
    }
  }

  // Try normal upload first (with retry for transient network issues)
  for (let attempt = 1; attempt <= maxRetries; ++attempt) {
    const { data, error } = await supabase.storage.from(bucket).upload(
      path, 
      file, 
      { 
        upsert: true,
        contentType: isPdf ? 'application/pdf' : undefined, // Ensure correct content type for PDFs
      }
    );
    
    if (!error) {
      return {
        success: true,
        method: attempt === 1 ? "standard" : `standard-retry-${attempt}`,
        data,
      };
    }

    console.warn(`Upload attempt ${attempt} failed:`, error);
    lastError = error;
    
    // Only retry on likely transient issues (network, 5XX)
    if (!(error.message?.includes('5'))) break;
    
    // Short delay before retry
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    console.log("JWT error detected, attempting token refresh and retry");
    
    // Attempt token refresh and one more upload
    const { data: sessData, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && sessData?.session) {
      const { data, error } = await supabase.storage.from(bucket).upload(
        path, 
        file, 
        { 
          upsert: true,
          contentType: isPdf ? 'application/pdf' : undefined, 
        }
      );
      
      if (!error) {
        return {
          success: true,
          method: "refresh-and-retry",
          data,
        };
      }
      lastError = error;
    }

    // Try direct upload fallback for PDF files or if explicitly requested
    if (isPdf || options.forceMethod) {
      console.log("Attempting direct FormData upload as final fallback");
      
      try {
        const directResult = await testDirectUpload(file, bucket, path);
        if (directResult.success) {
          return {
            success: true,
            method: "direct-upload-fallback",
            data: directResult.data,
          };
        }
        lastError = directResult.error;
      } catch (directError) {
        console.error("Direct upload fallback failed:", directError);
        lastError = directError;
      }
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
 * Specialized function for reliable PDF uploads that handles all edge cases
 */
export async function uploadPdfReliably(
  bucket: string, 
  path: string, 
  pdfFile: File
): Promise<{ success: boolean; url?: string; error?: any }> {
  console.group('PDF Upload Process');
  
  try {
    // 1. Validate the file
    if (pdfFile.type !== 'application/pdf') {
      throw new Error('Not a PDF file');
    }
    
    // 2. Use the enhanced reliable upload function
    const result = await reliableUpload(bucket, path, pdfFile, {
      maxRetries: 3,
      runDiagnostics: true,
      forceMethod: pdfFile.size > 5 * 1024 * 1024 ? "PUT" : "POST"
    });
    
    if (!result.success) {
      console.error('PDF upload failed with method:', result.method);
      throw new Error(
        typeof result.error === 'object' 
          ? result.error.message || JSON.stringify(result.error) 
          : String(result.error)
      );
    }
    
    // 3. Generate public URL for the file
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    console.log('Upload complete:', publicUrl);
    console.groupEnd();
    
    return {
      success: true,
      url: publicUrl?.publicUrl
    };
    
  } catch (error) {
    console.error('PDF upload failed:', error);
    console.groupEnd();
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

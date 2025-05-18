import { supabase } from "@/lib/supabase";
import { logAuthEvent, recordSessionEvent } from "./debugMode";

interface StoragePermissionCheck {
  bucket: string;
  canUpload: boolean;
  canDownload: boolean;
  error?: string;
}

/**
 * Check storage bucket permissions
 * @param bucketName The bucket name to check
 */
export const checkStorageBucketPermissions = async (bucketName: string): Promise<StoragePermissionCheck> => {
  try {
    recordSessionEvent(`checking_bucket_permissions_${bucketName}`);
    
    // Try to list files in bucket to check permissions
    const { data: fileList, error: listError } = await supabase
      .storage
      .from(bucketName)
      .list('', { limit: 1 });
    
    // Check upload permissions with a dummy file
    let canUpload = false;
    const testFileContents = new Blob(['test'], { type: 'text/plain' });
    const testFilePath = `_permission_check_${Date.now()}.txt`;
    
    try {
      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(testFilePath, testFileContents, { upsert: true });
      
      if (!uploadError) {
        canUpload = true;
        
        // Clean up the test file
        await supabase
          .storage
          .from(bucketName)
          .remove([testFilePath]);
      }
    } catch (uploadErr) {
      logAuthEvent(`Upload permission check failed: ${uploadErr instanceof Error ? uploadErr.message : String(uploadErr)}`);
    }
    
    return {
      bucket: bucketName,
      canUpload,
      canDownload: !listError,
      error: listError ? listError.message : undefined
    };
  } catch (error) {
    logAuthEvent(`Bucket permission check failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      bucket: bucketName,
      canUpload: false,
      canDownload: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test upload functionality - useful for troubleshooting file upload issues
 * @param bucketName The bucket to test upload to
 * @param filePath The path to upload to
 */
export const testUpload = async (bucketName: string, filePath: string): Promise<{
  success: boolean;
  uploadSpeed?: number; // bytes per second
  error?: string;
  uploadId?: string;
}> => {
  try {
    recordSessionEvent(`test_upload_start_${bucketName}`);
    
    // Create a test file (10KB)
    const size = 10 * 1024; // 10KB
    const testData = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      testData[i] = i % 256;
    }
    
    const testFileContents = new Blob([testData], { type: 'application/octet-stream' });
    const testFilePath = filePath || `_upload_test_${Date.now()}.bin`;
    
    const startTime = performance.now();
    
    // Try the upload
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(testFilePath, testFileContents, { upsert: true });
    
    const endTime = performance.now();
    
    if (error) {
      logAuthEvent(`Test upload failed: ${error.message}`);
      recordSessionEvent(`test_upload_fail_${bucketName}`);
      return {
        success: false,
        error: error.message
      };
    }
    
    // Calculate upload speed
    const durationMs = endTime - startTime;
    const uploadSpeed = (size / (durationMs / 1000));
    
    recordSessionEvent(`test_upload_success_${bucketName}`);
    
    // Clean up after successful test
    setTimeout(() => {
      supabase
        .storage
        .from(bucketName)
        .remove([testFilePath])
        .then(() => {
          logAuthEvent(`Test upload file cleaned up: ${testFilePath}`);
        })
        .catch((cleanupError) => {
          logAuthEvent(`Failed to clean up test file: ${cleanupError}`);
        });
    }, 5000);
    
    return {
      success: true,
      uploadSpeed,
      uploadId: data?.id
    };
  } catch (error) {
    logAuthEvent(`Test upload threw an exception: ${error instanceof Error ? error.message : String(error)}`);
    recordSessionEvent(`test_upload_exception_${bucketName}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Test direct upload functionality using fetch API
 * Used as a fallback when regular Supabase client upload fails
 * @param file The file to upload
 * @param bucket The bucket to upload to
 * @param filePath The path to upload to
 * @returns Object with success status and error/data
 */
export const testDirectUpload = async (
  file: File,
  bucket: string,
  filePath: string
): Promise<{
  success: boolean;
  data?: any;
  error?: any;
}> => {
  try {
    recordSessionEvent(`direct_upload_test_start_${bucket}`);
    
    // Get current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      logAuthEvent(`Direct upload test failed: No valid session`);
      return {
        success: false,
        error: sessionError || new Error("No valid session")
      };
    }
    
    // Create form data for the file
    const formData = new FormData();
    formData.append('file', file);
    
    // Create URL parameters
    const queryParams = new URLSearchParams();
    queryParams.append('upsert', 'true');
    
    // Start timing
    const startTime = performance.now();
    
    // Make direct call to storage API
    const response = await fetch(
      `https://plxuyxacefgttimodrbp.supabase.co/storage/v1/object/${bucket}/${filePath}?${queryParams.toString()}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session.access_token}`,
          // No Content-Type header - it will be set by the browser for multipart/form-data
        },
        body: formData
      }
    );
    
    const endTime = performance.now();
    const uploadDuration = endTime - startTime;
    
    // Log performance metrics
    logAuthEvent(`Direct upload test completed in ${uploadDuration}ms`);
    
    if (!response.ok) {
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }
      
      logAuthEvent(`Direct upload test failed: ${response.status} ${responseData?.message || responseText}`);
      recordSessionEvent(`direct_upload_test_fail_${bucket}`);
      
      return {
        success: false,
        error: responseData
      };
    }
    
    // Parse response data
    const responseData = await response.json();
    
    recordSessionEvent(`direct_upload_test_success_${bucket}`);
    
    return {
      success: true,
      data: responseData
    };
  } catch (error) {
    logAuthEvent(`Direct upload test exception: ${error instanceof Error ? error.message : String(error)}`);
    recordSessionEvent(`direct_upload_test_exception_${bucket}`);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Run a comprehensive storage diagnostic
 */
export const runStorageDiagnostics = async (): Promise<{
  success: boolean;
  bucketPermissions: StoragePermissionCheck[];
  uploadTest?: {
    success: boolean;
    uploadSpeed?: number;
    error?: string;
  };
  recommendations: string[];
}> => {
  try {
    recordSessionEvent('storage_diagnostics_start');
    
    // Check common buckets
    const buckets = ['documents', 'avatars', 'uploads'];
    const bucketPermissions: StoragePermissionCheck[] = [];
    
    for (const bucket of buckets) {
      const result = await checkStorageBucketPermissions(bucket);
      bucketPermissions.push(result);
    }
    
    // Run test upload on the first writable bucket
    const writableBucket = bucketPermissions.find(b => b.canUpload);
    let uploadTest;
    
    if (writableBucket) {
      uploadTest = await testUpload(writableBucket.bucket, `_diagnostic_test_${Date.now()}.bin`);
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (!writableBucket) {
      recommendations.push("Check storage bucket permissions in Supabase dashboard");
      recommendations.push("Verify RLS policies for storage buckets");
    }
    
    if (uploadTest && !uploadTest.success) {
      recommendations.push("Verify user has correct storage permissions");
      recommendations.push("Check network connection and firewall settings");
    }
    
    recordSessionEvent('storage_diagnostics_complete');
    
    return {
      success: !!writableBucket && (uploadTest?.success || false),
      bucketPermissions,
      uploadTest,
      recommendations
    };
  } catch (error) {
    logAuthEvent(`Storage diagnostics failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      success: false,
      bucketPermissions: [],
      recommendations: [
        "Failed to run storage diagnostics - check network connectivity",
        "Verify authentication is working correctly"
      ]
    };
  }
};

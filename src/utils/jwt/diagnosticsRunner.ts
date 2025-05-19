
import { supabase } from "@/lib/supabase";
import { checkStorageBucketPermissions, testDirectUpload, testUpload } from "../storageDiagnostics";
import { checkJwtToken } from "./tokenChecker";
import { logAuthEvent, recordSessionEvent } from "../debugMode";
import { getBrowserStorageInfo } from "../browserDiagnostics";

/**
 * Run a comprehensive diagnostic check of JWT, storage permissions, and upload functionality
 * Useful for debugging file upload and access issues
 */
export const runFullDiagnostics = async (testFile?: File): Promise<{
  jwtVerification: {
    isValid: boolean;
    timeRemaining?: number; // In seconds
    reason?: string;
  };
  storagePermissions: {
    canListBuckets: boolean;
    buckets: string[];
    canListFiles: boolean;
    error?: string;
  };
  browserStorage: {
    localStorage?: {
      count: number;
      keys: string[];
      error?: string;
    };
    sessionStorage?: {
      count: number;
      keys: string[];
      error?: string;
    };
    error?: string;
  };
  directUpload?: {
    success: boolean;
    status?: number;
    response?: any;
    error?: string;
  };
  uploadTest?: {
    success: boolean;
    uploadSpeed?: number;
    error?: string;
  };
  recommendations: string[];
}> => {
  try {
    recordSessionEvent('full_diagnostics_start');
    const results: any = {
      recommendations: []
    };
    
    // Step 1: Check JWT token
    try {
      const tokenCheck = await checkJwtToken();
      results.jwtVerification = tokenCheck;
      
      if (!tokenCheck.isValid) {
        results.recommendations.push("JWT token is invalid. Try logging out and back in.");
      } else if (tokenCheck.timeRemaining && tokenCheck.timeRemaining < 300) {
        results.recommendations.push("JWT token expires soon. Refresh your session.");
      }
    } catch (error) {
      logAuthEvent(`JWT verification failed: ${error instanceof Error ? error.message : String(error)}`);
      results.jwtVerification = {
        isValid: false,
        reason: error instanceof Error ? error.message : String(error)
      };
      results.recommendations.push("Authentication error. Try logging out and back in.");
    }
    
    // Step 2: Check storage permissions
    try {
      // List buckets
      const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets();
      
      results.storagePermissions = {
        canListBuckets: !bucketError && Array.isArray(bucketList),
        buckets: bucketList?.map(b => b.name) || [],
        canListFiles: false
      };
      
      if (bucketError) {
        results.storagePermissions.error = bucketError.message;
        results.recommendations.push("Cannot access storage buckets. Check storage permissions.");
      }
      
      // Test list files in first bucket if buckets exist
      if (bucketList && bucketList.length > 0) {
        const firstBucket = bucketList[0].name;
        const { error: listFilesError } = await supabase.storage.from(firstBucket).list();
        
        results.storagePermissions.canListFiles = !listFilesError;
        
        if (listFilesError) {
          results.recommendations.push(`Cannot list files in bucket "${firstBucket}". Check bucket permissions.`);
        }
      }
      
      // Also check permissions with our specialized function
      if (results.storagePermissions.buckets.length > 0) {
        const firstBucket = results.storagePermissions.buckets[0];
        const permissionCheck = await checkStorageBucketPermissions(firstBucket);
        
        if (!permissionCheck.canDownload) {
          results.recommendations.push(`No download permissions for bucket "${firstBucket}".`);
        }
        if (!permissionCheck.canUpload) {
          results.recommendations.push(`No upload permissions for bucket "${firstBucket}".`);
        }
      }
    } catch (error) {
      logAuthEvent(`Storage permission check failed: ${error instanceof Error ? error.message : String(error)}`);
      results.storagePermissions = {
        canListBuckets: false,
        buckets: [],
        canListFiles: false,
        error: error instanceof Error ? error.message : String(error)
      };
      results.recommendations.push("Storage access failed. Check your network connection and permissions.");
    }
    
    // Step 3: Check browser storage
    try {
      results.browserStorage = getBrowserStorageInfo();
      
      if (results.browserStorage.localStorage && results.browserStorage.localStorage.count === 0) {
        results.recommendations.push("No Supabase keys in localStorage. Authentication may be incomplete.");
      }
    } catch (error) {
      logAuthEvent(`Browser storage check failed: ${error instanceof Error ? error.message : String(error)}`);
      results.browserStorage = {
        error: error instanceof Error ? error.message : String(error)
      };
    }
    
    // Step 4: Test direct and SDK uploads if a test file is provided
    if (testFile) {
      // Test direct upload (without Supabase client)
      try {
        const testFilePath = `_diagnostic_test_${Date.now()}.txt`;
        const testBucket = results.storagePermissions.buckets.length > 0 ? 
          results.storagePermissions.buckets[0] : 'documents';
        
        const directResult = await testDirectUpload(
          testFile,
          testBucket,
          testFilePath
        );
        
        results.directUpload = directResult;
        
        if (!directResult.success) {
          results.recommendations.push("Direct API upload failed. This may indicate permission or CORS issues.");
        }
      } catch (error) {
        logAuthEvent(`Direct upload test failed: ${error instanceof Error ? error.message : String(error)}`);
        results.directUpload = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
      
      // Test upload using Supabase client
      try {
        const testBucket = results.storagePermissions.buckets.length > 0 ? 
          results.storagePermissions.buckets[0] : 'documents';
          
        const uploadResult = await testUpload(
          testBucket,
          `_sdk_test_${Date.now()}.txt`
        );
        
        results.uploadTest = uploadResult;
        
        if (!uploadResult.success) {
          results.recommendations.push("SDK upload failed. Check your network connection and permissions.");
        }
      } catch (error) {
        logAuthEvent(`SDK upload test failed: ${error instanceof Error ? error.message : String(error)}`);
        results.uploadTest = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    // Step 5: Generate general recommendations based on all checks
    if (!results.jwtVerification.isValid) {
      results.recommendations.push("Re-authenticate to obtain a fresh JWT token.");
    }
    
    if (!results.storagePermissions.canListBuckets) {
      results.recommendations.push("Verify storage permissions in Supabase dashboard.");
    }
    
    if (testFile && (!results.directUpload?.success && !results.uploadTest?.success)) {
      results.recommendations.push("All upload methods failed. This could be a network issue or incorrect project configuration.");
    }
    
    recordSessionEvent('full_diagnostics_complete');
    
    return results;
  } catch (error) {
    logAuthEvent(`Full diagnostics failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      jwtVerification: { isValid: false, reason: "Diagnostics failed to run" },
      storagePermissions: { canListBuckets: false, buckets: [], canListFiles: false },
      browserStorage: { error: "Diagnostics failed" },
      recommendations: [
        "Diagnostics failed to run. Check network connectivity.",
        "Try refreshing the page and running diagnostics again."
      ]
    };
  }
};

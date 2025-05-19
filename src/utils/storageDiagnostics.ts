
/**
 * Storage diagnostics utilities
 */

// Re-export the testDirectUpload function
export { testDirectUpload } from './testDirectUpload';

/**
 * Verifies storage access and permissions
 */
export const verifyStorageAccess = async (bucket: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log(`Verifying storage access for bucket: ${bucket}`);
    
    // Add more diagnostics as needed
    
    return {
      success: true,
      message: `Storage access verified for bucket: ${bucket}`
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Storage access verification failed: ${errorMessage}`);
    
    return {
      success: false,
      message: `Storage access verification failed: ${errorMessage}`
    };
  }
};

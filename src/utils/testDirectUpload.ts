
import { supabase } from "@/lib/supabase";
import { logAuthEvent, recordSessionEvent } from "./debugMode";

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


import { checkAndRefreshToken } from "@/utils/jwtMonitoring";
import { supabase } from "@/lib/supabase";
import logger from "@/utils/logger";

/**
 * Types for PDF viewer utility
 */
export interface PdfViewerOptions {
  cacheBust?: boolean;
  maxRetries?: number;
  timeout?: number;
  forceGoogleViewer?: boolean;
}

export interface PdfLoadResult {
  url: string | null;
  success: boolean;
  method: 'direct' | 'signed' | 'public' | 'google' | 'failed';
  error?: string | Error;
}

/**
 * Get a reliable PDF URL for viewing, with fallbacks
 * @param storagePath Storage path of the PDF
 * @param bucketName Bucket name where PDF is stored (default: 'documents')
 * @param options Optional configuration
 * @returns PdfLoadResult with URL and status information
 */
export async function getPdfViewUrl(
  storagePath: string,
  bucketName: string = 'documents',
  options: PdfViewerOptions = {}
): Promise<PdfLoadResult> {
  const {
    cacheBust = true,
    maxRetries = 2,
    timeout = 10000,
    forceGoogleViewer = false
  } = options;
  
  logger.info(`Loading PDF from ${bucketName}/${storagePath}`);
  
  // Method 1: Try to get a signed URL first (most secure)
  try {
    // Ensure fresh auth token
    await checkAndRefreshToken();
    
    const { data: urlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 3600);
    
    if (!urlError && urlData?.signedUrl) {
      const url = cacheBust ? `${urlData.signedUrl}&t=${Date.now()}` : urlData.signedUrl;
      logger.info(`PDF loaded successfully using signed URL`);
      return { url, success: true, method: 'signed' };
    }
    
    // If signed URL fails but doesn't throw, continue to next method
    logger.warn(`Failed to get signed URL: ${urlError?.message || 'No signed URL returned'}`);
  } catch (error) {
    logger.error('Error getting signed URL:', error);
    // Continue to next method
  }
  
  // Method 2: Try to get a public URL
  try {
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    
    if (publicUrlData?.publicUrl) {
      const url = cacheBust ? `${publicUrlData.publicUrl}?t=${Date.now()}` : publicUrlData.publicUrl;
      logger.info(`PDF loaded successfully using public URL`);
      return { url, success: true, method: 'public' };
    }
  } catch (error) {
    logger.error('Error getting public URL:', error);
    // Continue to next method
  }
  
  // Method 3: If Google Viewer is forced or we've exhausted other options
  if (forceGoogleViewer || options.maxRetries === 0) {
    try {
      // Get public URL for Google Viewer (without checking if it works)
      const { data: fallbackUrlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
      
      if (fallbackUrlData?.publicUrl) {
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fallbackUrlData.publicUrl)}&embedded=true`;
        logger.info(`Using Google Docs viewer as fallback`);
        return { url: googleViewerUrl, success: true, method: 'google' };
      }
    } catch (error) {
      logger.error('Error setting up Google viewer fallback:', error);
    }
  }
  
  // All methods failed
  return {
    url: null,
    success: false,
    method: 'failed',
    error: 'Failed to load PDF after trying all methods'
  };
}

/**
 * Check if a PDF file exists and is accessible
 * @param storagePath Storage path of the PDF
 * @param bucketName Bucket name where PDF is stored
 * @returns boolean indicating whether the file exists and is accessible
 */
export async function checkPdfExists(storagePath: string, bucketName: string = 'documents'): Promise<boolean> {
  try {
    await checkAndRefreshToken();
    
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(storagePath, 60); // Short-lived URL just to check existence
    
    if (error || !data?.signedUrl) {
      logger.warn(`PDF check failed via signed URL: ${error?.message || 'No URL returned'}`);
      
      // Try public URL as fallback for checking
      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
      
      if (!publicData?.publicUrl) {
        return false;
      }
      
      // Make a HEAD request to check if file exists via public URL
      const response = await fetch(publicData.publicUrl, { method: 'HEAD' });
      return response.ok;
    }
    
    return true;
  } catch (error) {
    logger.error('Error checking if PDF exists:', error);
    return false;
  }
}

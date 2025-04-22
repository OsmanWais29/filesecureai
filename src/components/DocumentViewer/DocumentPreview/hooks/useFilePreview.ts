import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useNetworkMonitor } from './useNetworkMonitor';
import { useRetryStrategy } from './useRetryStrategy';
import { toast } from 'sonner';
import { checkAndRefreshToken } from "@/utils/jwtMonitoring";

interface UseFilePreviewProps {
  storagePath: string;
  setFileExists: (exists: boolean) => void;
  setFileUrl: (url: string | null) => void;
  setIsExcelFile: (isExcel: boolean) => void;
  setPreviewError: (error: string | null) => void;
  setFileType?: (type: string | null) => void;
}

export function useFilePreview({
  storagePath,
  setFileExists,
  setFileUrl,
  setIsExcelFile,
  setPreviewError,
  setFileType
}: UseFilePreviewProps) {
  const [hasFileLoadStarted, setHasFileLoadStarted] = useState(false);
  const { 
    networkStatus, 
    handleOnline, 
    handleOffline,
    isLimitedConnectivity 
  } = useNetworkMonitor();
  
  const { 
    attemptCount, 
    incrementAttempt, 
    resetAttempts, 
    shouldRetry,
    getRetryDelay,
    lastAttempt,
    setLastAttempt,
    lastErrorType,
    getDiagnostics
  } = useRetryStrategy(5); // Increase max attempts to 5

  // Track whether we've tried token refresh
  const [hasTriedTokenRefresh, setHasTriedTokenRefresh] = useState(false);
  // Track whether we've tried Google Docs viewer as fallback
  const [hasTriedGoogleViewer, setHasTriedGoogleViewer] = useState(false);
  // Track whether we've tried public URL fallback
  const [hasTriedPublicUrl, setHasTriedPublicUrl] = useState(false);

  // First, declare checkFile function before it's used
  // Check if the file exists and get its URL with enhanced error handling
  const checkFile = useCallback(async (path?: string) => {
    setHasFileLoadStarted(true);
    const filePath = path || storagePath;
    
    if (!filePath) {
      setPreviewError('No file path provided');
      setFileExists(false);
      return;
    }
    
    console.group('📄 Checking File');
    console.log('Checking file path:', filePath);
    console.log('Current attempt:', attemptCount + 1);
    console.log('Network status:', networkStatus);
    
    try {
      // Mark as online since we're making a request
      handleOnline();
      
      // For auth errors, ensure we have a fresh token first
      if (lastErrorType === 'auth' || attemptCount > 2) {
        console.log('Pre-emptively refreshing token due to previous errors or multiple attempts');
        try {
          await checkAndRefreshToken();
        } catch (refreshError) {
          console.warn('Token pre-refresh failed:', refreshError);
          // Continue anyway, the request might still work
        }
      }
      
      // Extract file name and path parts
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop() || '';
      const folderPath = pathParts.join('/');
      
      console.log('Folder path:', folderPath);
      console.log('File name:', fileName);
      
      // Check if the file exists by listing the folder contents
      const { data: fileList, error: listError } = await supabase
        .storage
        .from('documents')
        .list(folderPath, {
          limit: 100,
          search: fileName
        });
        
      if (listError) {
        throw listError;
      }
      
      // Check if we found our file (case-insensitive to be more robust)
      const fileExists = fileList && fileList.some(file => 
        file.name.toLowerCase() === fileName.toLowerCase()
      );
      
      console.log('File exists in storage:', fileExists);
      setFileExists(fileExists);
      
      if (!fileExists) {
        setPreviewError('File not found in storage');
        console.groupEnd();
        return;
      }
      
      // Get the public URL as a backup/fallback
      const publicUrlData = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData?.data?.publicUrl;
      console.log('Public URL (fallback):', publicUrl);
      
      // Determine file type
      const isExcel = /\.(xlsx|xls|csv)$/i.test(fileName);
      setIsExcelFile(isExcel);
      
      // Add file type detection
      if (setFileType) {
        if (fileName.toLowerCase().endsWith('.pdf')) {
          setFileType('pdf');
        } else if (fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) {
          setFileType('image');
        } else if (fileName.match(/\.(xlsx?|csv)$/i)) {
          setFileType('excel');
        } else if (fileName.match(/\.(docx?|txt|rtf)$/i)) {
          setFileType('document');
        } else {
          setFileType('other');
        }
      }
      
      // Get a signed URL for the file with longer expiry time
      console.log('Getting signed URL...');
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
        
      if (urlError) {
        console.error('Error getting signed URL:', urlError);
        // If there's a public URL, use that as a fallback
        if (publicUrl) {
          console.log('Falling back to public URL');
          setFileUrl(publicUrl);
          setPreviewError(null);
          resetAttempts();
          console.groupEnd();
          return;
        }
        throw urlError;
      }
      
      console.log('Got signed URL successfully');
      setFileUrl(urlData?.signedUrl || null);
      
      // Clear any previous errors if successful
      setPreviewError(null);
      resetAttempts();
      
      // Reset fallback flags on success
      setHasTriedTokenRefresh(false);
      setHasTriedGoogleViewer(false);
      setHasTriedPublicUrl(false);
      
      console.groupEnd();
    } catch (error) {
      // Get the public URL to use as potential fallback
      const publicUrlData = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData?.data?.publicUrl;
      handleFileCheckError(error, publicUrl);
    }
  }, [
    storagePath, 
    setFileExists, 
    setFileUrl, 
    setIsExcelFile, 
    setPreviewError,
    setFileType,
    handleOnline,
    resetAttempts,
    networkStatus,
    attemptCount,
    lastErrorType,
    // Note: handleFileCheckError is declared later but would be included in dependencies
  ]);

  // Handle errors during file checking with enhanced diagnostics
  const handleFileCheckError = useCallback(async (error: any, publicUrl?: string | null) => {
    console.group('📄 File Check Error');
    console.error('Error checking file:', error);
    console.log('Current retry attempt:', attemptCount + 1);
    console.log('StoragePath:', storagePath);
    
    // Detect error type for better handling
    const errorMsg = error?.message?.toLowerCase() || '';
    const isNetworkError = errorMsg.includes('network') || errorMsg.includes('fetch');
    const isAuthError = errorMsg.includes('token') || errorMsg.includes('auth') || errorMsg.includes('jwt');
    const isNotFoundError = errorMsg.includes('not found') || errorMsg.includes('404');
    const isCorsError = errorMsg.includes('cors') || errorMsg.includes('origin');
    
    console.log('Error analysis:', {
      isNetworkError,
      isAuthError, 
      isNotFoundError,
      isCorsError
    });
    
    // Clear URL while we handle the error
    setFileUrl(null);
    
    // Special handling based on error type
    if (isNetworkError) {
      handleOffline();
      setPreviewError('Network error while loading document. Retrying when connection improves...');
    } else if (isAuthError && !hasTriedTokenRefresh) {
      // Try to refresh the token on auth errors
      setPreviewError('Authentication error. Refreshing credentials...');
      setHasTriedTokenRefresh(true);
      
      // Try to refresh token and retry
      console.log('Attempting token refresh...');
      try {
        const tokenResult = await checkAndRefreshToken();
        console.log('Token refresh result:', tokenResult);
        
        // Retry after short delay
        setTimeout(() => checkFile(), 1000);
        console.groupEnd();
        return;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    } else if (isNotFoundError) {
      // For not found errors, try the public URL as fallback if we haven't yet
      if (!hasTriedPublicUrl && publicUrl) {
        setHasTriedPublicUrl(true);
        console.log('Trying public URL as fallback...');
        setFileUrl(publicUrl);
        setPreviewError(null);
        console.groupEnd();
        return;
      } else {
        setPreviewError('Document not found in storage. It may have been deleted or moved.');
      }
    } else if (isCorsError && !hasTriedGoogleViewer) {
      // For CORS errors, we can try Google Docs viewer as a fallback
      setHasTriedGoogleViewer(true);
      setPreviewError('CORS issue detected. Trying alternative viewer...');
      
      if (publicUrl) {
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicUrl)}&embedded=true`;
        console.log('Using Google Docs viewer fallback:', googleViewerUrl);
        setFileUrl(googleViewerUrl);
        console.groupEnd();
        return;
      }
    } else {
      setPreviewError(error.message || 'An unknown error occurred while loading the document.');
    }
    
    setFileExists(false);
    incrementAttempt(error);
    console.log('Updated diagnostics:', getDiagnostics());
    console.groupEnd();
  }, [
    handleOffline, 
    incrementAttempt, 
    setFileExists, 
    setFileUrl, 
    setPreviewError, 
    attemptCount, 
    storagePath,
    hasTriedTokenRefresh,
    hasTriedGoogleViewer,
    hasTriedPublicUrl,
    getDiagnostics,
    checkFile
  ]);

  // Initial file check on component mount or when path changes
  useEffect(() => {
    if (storagePath && !hasFileLoadStarted) {
      checkFile();
    }
  }, [storagePath, checkFile, hasFileLoadStarted]);
  
  // Handle automatic retries on network failure
  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout>;
    
    // Retry conditions:
    // 1. When offline and should retry
    // 2. When we got an auth error and haven't tried token refresh
    // 3. When we have limited connectivity
    const shouldAttemptRetry = (
      (networkStatus === 'offline' && shouldRetry(attemptCount)) ||
      (lastErrorType === 'auth' && !hasTriedTokenRefresh && shouldRetry(attemptCount)) ||
      (isLimitedConnectivity && shouldRetry(attemptCount))
    );
    
    if (shouldAttemptRetry) {
      const delay = getRetryDelay(attemptCount);
      console.log(`Will retry file check in ${delay}ms (attempt ${attemptCount + 1})`);
      
      retryTimeout = setTimeout(() => {
        console.log('Retrying file check...');
        checkFile();
        setLastAttempt(new Date());
      }, delay);
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [
    networkStatus, 
    attemptCount, 
    shouldRetry, 
    getRetryDelay, 
    checkFile, 
    setLastAttempt,
    lastErrorType,
    hasTriedTokenRefresh,
    isLimitedConnectivity
  ]);

  // Public methods for manual operations
  const forceRefresh = useCallback(async () => {
    resetAttempts();
    setHasTriedTokenRefresh(false);
    setHasTriedGoogleViewer(false);
    setHasTriedPublicUrl(false);
    setPreviewError(null);
    
    // Pre-emptively refresh token
    try {
      await checkAndRefreshToken();
      toast.success("Authentication refreshed, retrying document load...");
    } catch (e) {
      console.warn("Token refresh failed:", e);
    }
    
    checkFile();
  }, [resetAttempts, checkFile]);

  return {
    checkFile,
    handleFileCheckError,
    networkStatus,
    attemptCount,
    hasFileLoadStarted,
    resetRetries: resetAttempts,
    forceRefresh,
    diagnostics: getDiagnostics()
  };
}

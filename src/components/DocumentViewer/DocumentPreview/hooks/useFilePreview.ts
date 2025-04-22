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
    incrementAttempt, 
    resetAttempts, 
    shouldRetry, 
    getRetryDelay, 
    lastAttempt, 
    setLastAttempt, 
    lastErrorType, 
    getDiagnostics 
  } = useRetryStrategy({ maxRetries: 5 });

  const [hasTriedTokenRefresh, setHasTriedTokenRefresh] = useState(false);
  const [hasTriedGoogleViewer, setHasTriedGoogleViewer] = useState(false);
  const [hasTriedPublicUrl, setHasTriedPublicUrl] = useState(false);

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
    console.log('Current attempt:', (getDiagnostics().attemptCount || 0) + 1);
    console.log('Network status:', networkStatus);
    
    try {
      handleOnline();
      if (lastErrorType === 'auth' || (getDiagnostics().attemptCount || 0) > 2) {
        console.log('Pre-emptively refreshing token due to previous errors or multiple attempts');
        try {
          await checkAndRefreshToken();
        } catch (refreshError) {
          console.warn('Token pre-refresh failed:', refreshError);
        }
      }
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop() || '';
      const folderPath = pathParts.join('/');
      console.log('Folder path:', folderPath);
      console.log('File name:', fileName);

      const { data: fileList, error: listError } = await supabase
        .storage
        .from('documents')
        .list(folderPath, {
          limit: 100,
          search: fileName
        });
      if (listError) throw listError;
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
      const publicUrlData = supabase
        .storage
        .from('documents')
        .getPublicUrl(filePath);
      const publicUrl = publicUrlData?.data?.publicUrl;
      console.log('Public URL (fallback):', publicUrl);

      const isExcel = /\.(xlsx|xls|csv)$/i.test(fileName);
      setIsExcelFile(isExcel);
      if (setFileType) {
        if (fileName.toLowerCase().endsWith('.pdf')) setFileType('pdf');
        else if (fileName.match(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)) setFileType('image');
        else if (fileName.match(/\.(xlsx?|csv)$/i)) setFileType('excel');
        else if (fileName.match(/\.(docx?|txt|rtf)$/i)) setFileType('document');
        else setFileType('other');
      }
      console.log('Getting signed URL...');
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60);
      if (urlError) {
        console.error('Error getting signed URL:', urlError);
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
      setPreviewError(null);
      resetAttempts();
      setHasTriedTokenRefresh(false);
      setHasTriedGoogleViewer(false);
      setHasTriedPublicUrl(false);
      console.groupEnd();
    } catch (error: any) {
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
    lastErrorType,
    getDiagnostics,
  ]);

  const handleFileCheckError = useCallback(async (error: any, publicUrl?: string | null) => {
    console.group('📄 File Check Error');
    console.error('Error checking file:', error);
    const attemptCount = getDiagnostics().attemptCount || 0;
    console.log('Current retry attempt:', attemptCount + 1);
    console.log('StoragePath:', storagePath);
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
    setFileUrl(null);
    if (isNetworkError) {
      handleOffline();
      setPreviewError('Network error while loading document. Retrying when connection improves...');
    } else if (isAuthError && !hasTriedTokenRefresh) {
      setPreviewError('Authentication error. Refreshing credentials...');
      setHasTriedTokenRefresh(true);
      console.log('Attempting token refresh...');
      try {
        const tokenResult = await checkAndRefreshToken();
        console.log('Token refresh result:', tokenResult);
        setTimeout(() => checkFile(), 1000);
        console.groupEnd();
        return;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    } else if (isNotFoundError) {
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
    incrementAttempt(errorMsg);
    console.log('Updated diagnostics:', getDiagnostics());
    console.groupEnd();
  }, [
    handleOffline, 
    incrementAttempt, 
    setFileExists, 
    setFileUrl, 
    setPreviewError, 
    storagePath,
    hasTriedTokenRefresh,
    hasTriedGoogleViewer,
    hasTriedPublicUrl,
    getDiagnostics,
    checkFile
  ]);

  useEffect(() => {
    if (storagePath && !hasFileLoadStarted) {
      checkFile();
    }
  }, [storagePath, checkFile, hasFileLoadStarted]);

  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout>;
    const attemptCount = getDiagnostics().attemptCount || 0;
    const shouldAttemptRetry = (
      (networkStatus === 'offline' && shouldRetry('network')) ||
      (lastErrorType === 'auth' && !hasTriedTokenRefresh && shouldRetry('auth')) ||
      (isLimitedConnectivity && shouldRetry('network'))
    );
    if (shouldAttemptRetry) {
      const delay = getRetryDelay();
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
    getDiagnostics, 
    shouldRetry, 
    getRetryDelay, 
    checkFile, 
    setLastAttempt,
    lastErrorType,
    hasTriedTokenRefresh,
    isLimitedConnectivity
  ]);

  const forceRefresh = useCallback(async () => {
    resetAttempts();
    setHasTriedTokenRefresh(false);
    setHasTriedGoogleViewer(false);
    setHasTriedPublicUrl(false);
    setPreviewError(null);
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
    attemptCount: getDiagnostics().attemptCount,
    hasFileLoadStarted,
    resetRetries: resetAttempts,
    forceRefresh,
    diagnostics: getDiagnostics()
  };
}

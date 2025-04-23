
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useNetworkMonitor } from './useNetworkMonitor';
import { usePreviewRetry } from './usePreviewRetry';
import { toast } from 'sonner';
import { checkAndRefreshToken } from "@/utils/jwtMonitoring";
import { detectFileType, isExcelFile } from './fileTypeUtils';

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
    lastAttempt, 
    lastErrorType, 
    incrementAttempt, 
    resetAttempts, 
    shouldRetry, 
    getRetryDelay, 
    getDiagnostics,
    setLastAttempt
  } = usePreviewRetry(5);

  const [hasTriedTokenRefresh, setHasTriedTokenRefresh] = useState(false);
  const [hasTriedGoogleViewer, setHasTriedGoogleViewer] = useState(false);
  const [hasTriedPublicUrl, setHasTriedPublicUrl] = useState(false);

  // ---- Main business logic: Check file existence, get URL, set state
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
      handleOnline();
      if (lastErrorType === 'auth' || attemptCount > 2) {
        try {
          await checkAndRefreshToken();
        } catch (refreshError) {
          console.warn('Token pre-refresh failed:', refreshError);
        }
      }
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop() || '';
      const folderPath = pathParts.join('/');
      const { data: fileList, error: listError } = await supabase
        .storage
        .from('documents')
        .list(folderPath, { limit: 100, search: fileName });
      if (listError) throw listError;
      const fileExists = fileList && fileList.some(file => 
        file.name.toLowerCase() === fileName.toLowerCase()
      );
      setFileExists(fileExists);
      if (!fileExists) {
        setPreviewError('File not found in storage');
        console.groupEnd();
        return;
      }
      const publicUrlData = supabase.storage.from('documents').getPublicUrl(filePath);
      const publicUrl = publicUrlData?.data?.publicUrl;
      if (setFileType) setFileType(detectFileType(fileName));
      setIsExcelFile(isExcelFile(fileName));

      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(filePath, 3600);
      if (urlError) {
        if (publicUrl) {
          setFileUrl(publicUrl);
          setPreviewError(null);
          resetAttempts();
          console.groupEnd();
          return;
        }
        throw urlError;
      }
      setFileUrl(urlData?.signedUrl || null);
      setPreviewError(null);
      resetAttempts();
      setHasTriedTokenRefresh(false);
      setHasTriedGoogleViewer(false);
      setHasTriedPublicUrl(false);
      console.groupEnd();
    } catch (error: any) {
      const publicUrlData = supabase.storage.from('documents').getPublicUrl(filePath);
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
    attemptCount,
    lastErrorType,
    networkStatus
  ]);

  // ---- Error handling logic
  const handleFileCheckError = useCallback(async (error: any, publicUrl?: string | null) => {
    console.group('📄 File Check Error');
    console.error('Error checking file:', error);
    const errorMsg = error?.message?.toLowerCase() || '';
    const isNetworkError = errorMsg.includes('network') || errorMsg.includes('fetch');
    const isAuthError = errorMsg.includes('token') || errorMsg.includes('auth') || errorMsg.includes('jwt');
    const isNotFoundError = errorMsg.includes('not found') || errorMsg.includes('404');
    const isCorsError = errorMsg.includes('cors') || errorMsg.includes('origin');
    setFileUrl(null);

    if (isNetworkError) {
      handleOffline();
      setPreviewError('Network error while loading document. Retrying when connection improves...');
    } else if (isAuthError && !hasTriedTokenRefresh) {
      setPreviewError('Authentication error. Refreshing credentials...');
      setHasTriedTokenRefresh(true);
      try {
        await checkAndRefreshToken();
        setTimeout(() => checkFile(), 1000);
        console.groupEnd();
        return;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    } else if (isNotFoundError) {
      if (!hasTriedPublicUrl && publicUrl) {
        setHasTriedPublicUrl(true);
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
        setFileUrl(googleViewerUrl);
        console.groupEnd();
        return;
      }
    } else {
      setPreviewError(error.message || 'An unknown error occurred while loading the document.');
    }
    setFileExists(false);
    incrementAttempt(errorMsg);
    console.groupEnd();
  }, [
    handleOffline,
    incrementAttempt,
    setFileExists,
    setFileUrl,
    setPreviewError,
    hasTriedTokenRefresh,
    hasTriedGoogleViewer,
    hasTriedPublicUrl,
    checkFile
  ]);

  // ---- Initial load or path change
  useEffect(() => {
    if (storagePath && !hasFileLoadStarted) checkFile();
  }, [storagePath, checkFile, hasFileLoadStarted]);

  // ---- Retry logic
  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout>;
    const shouldAttemptRetry = (
      (networkStatus === 'offline' && shouldRetry()) ||
      (lastErrorType === 'auth' && !hasTriedTokenRefresh && shouldRetry()) ||
      (isLimitedConnectivity && shouldRetry())
    );
    if (shouldAttemptRetry) {
      const delay = getRetryDelay();
      retryTimeout = setTimeout(() => {
        checkFile();
        setLastAttempt(new Date());
      }, delay);
    }
    return () => retryTimeout && clearTimeout(retryTimeout);
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
    attemptCount,
    hasFileLoadStarted,
    resetRetries: resetAttempts,
    forceRefresh,
    diagnostics: getDiagnostics()
  };
}

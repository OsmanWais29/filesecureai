
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
        console.error('Auth refresh failed:', refreshError);
      }
    } else if (isNotFoundError) {
      setPreviewError('Document not found in storage');
    } else if (isCorsError) {
      setPreviewError('Cross-origin error. Trying alternative method...');
    } else {
      setPreviewError(`Error loading document: ${error.message || 'Unknown error'}`);
    }

    // Try public URL fallback if we haven't already
    if (publicUrl && !hasTriedPublicUrl) {
      setPreviewError('Trying public URL fallback...');
      setHasTriedPublicUrl(true);
      setFileUrl(publicUrl);
      console.log('Using public URL as fallback');
      console.groupEnd();
      return;
    }

    // If all else fails, and we haven't tried Google Docs viewer yet, try that
    if (!hasTriedGoogleViewer) {
      setPreviewError('Trying Google Docs viewer fallback...');
      setHasTriedGoogleViewer(true);
      if (publicUrl) {
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicUrl)}&embedded=true`;
        setFileUrl(googleDocsUrl);
        console.log('Using Google Docs viewer as fallback');
        console.groupEnd();
        return;
      }
    }

    // Determine if we should attempt again
    if (shouldRetry(errorMsg)) {
      const delay = getRetryDelay();
      console.log(`Scheduling retry in ${delay}ms`);
      setTimeout(() => checkFile(), delay);
    } else {
      setPreviewError('Failed to load document after multiple attempts');
    }
    console.groupEnd();
  }, [
    checkFile, 
    hasTriedTokenRefresh, 
    hasTriedGoogleViewer, 
    hasTriedPublicUrl, 
    handleOffline, 
    shouldRetry, 
    getRetryDelay
  ]);

  // Initial file check
  useEffect(() => {
    if (storagePath && !hasFileLoadStarted) {
      checkFile();
    }
  }, [storagePath, hasFileLoadStarted, checkFile]);

  // Auto-retry when network comes back online
  useEffect(() => {
    if (networkStatus === 'online' && lastErrorType === 'network') {
      console.log('Network reconnected, retrying file check');
      checkFile();
    }
  }, [networkStatus, lastErrorType, checkFile]);

  return {
    checkFile,
    networkStatus,
    attemptCount,
    hasFileLoadStarted,
    resetRetries: resetAttempts,
    forceRefresh: () => checkFile(),
    diagnostics: getDiagnostics()
  };
}

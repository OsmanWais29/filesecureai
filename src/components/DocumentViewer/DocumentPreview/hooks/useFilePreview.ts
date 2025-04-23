
// Refactored main hook that composes smaller hooks for clarity
import { useState, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { useRetryHandler } from './useRetryHandler';
import { useSupabaseFile } from './useSupabaseFile';
import { useFilePreviewError } from './useFilePreviewError';

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
  // Compose hooks for separate concerns
  const [hasFileLoadStarted, setHasFileLoadStarted] = useState(false);
  const [hasTriedTokenRefresh, setHasTriedTokenRefresh] = useState(false);
  const [hasTriedGoogleViewer, setHasTriedGoogleViewer] = useState(false);
  const [hasTriedPublicUrl, setHasTriedPublicUrl] = useState(false);

  const { networkStatus, handleOnline, handleOffline, isLimitedConnectivity } = useNetworkStatus();
  const { 
    attemptCount, lastErrorType, incrementAttempt, resetRetries, shouldRetry, getRetryDelay
  } = useRetryHandler(5);
  const { setPreviewError: safeSetPreviewError } = useFilePreviewError(setPreviewError);

  const { checkFile } = useSupabaseFile({
    storagePath,
    setFileExists,
    setFileUrl,
    setIsExcelFile,
    setPreviewError: safeSetPreviewError,
    setFileType,
    handleOnline,
    handleOffline,
    attemptCount,
    lastErrorType,
    incrementAttempt,
    resetRetries,
    shouldRetry,
    getRetryDelay,
    hasTriedTokenRefresh,
    setHasTriedTokenRefresh,
    hasTriedGoogleViewer,
    setHasTriedGoogleViewer,
    hasTriedPublicUrl,
    setHasTriedPublicUrl
  });

  // Initial file check
  useEffect(() => {
    if (storagePath && !hasFileLoadStarted) {
      setHasFileLoadStarted(true);
      checkFile();
    }
  }, [storagePath, hasFileLoadStarted, checkFile]);

  // Auto-retry when network comes back online
  useEffect(() => {
    if (networkStatus === 'online' && lastErrorType === 'network') {
      checkFile();
    }
  }, [networkStatus, lastErrorType, checkFile]);

  // Reset retry when explicitly requested
  const forceRefresh = () => checkFile();

  // Diagnostics for error reporting if needed in the UI
  const diagnostics = {
    attemptCount,
    networkStatus,
    lastErrorType,
    hasTriedTokenRefresh,
    hasTriedGoogleViewer,
    hasTriedPublicUrl
  };

  return {
    checkFile,
    networkStatus,
    attemptCount,
    hasFileLoadStarted,
    resetRetries,
    forceRefresh,
    diagnostics
  };
}


import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { detectFileType, isExcelFile } from "./fileTypeUtils";
import { checkAndRefreshToken } from "@/utils/jwtMonitoring";

export function useSupabaseFile({
  storagePath,
  setFileExists,
  setFileUrl,
  setIsExcelFile,
  setPreviewError,
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
}: {
  storagePath: string;
  setFileExists: (x: boolean) => void;
  setFileUrl: (x: string | null) => void;
  setIsExcelFile: (x: boolean) => void;
  setPreviewError: (x: string | null) => void;
  setFileType?: (x: string | null) => void;
  handleOnline: () => void;
  handleOffline: () => void;
  attemptCount: number;
  lastErrorType: string | null;
  incrementAttempt: (err?: Error | string | null) => void;
  resetRetries: () => void;
  shouldRetry: () => boolean;
  getRetryDelay: () => number;
  hasTriedTokenRefresh: boolean;
  setHasTriedTokenRefresh: (x: boolean) => void;
  hasTriedGoogleViewer: boolean;
  setHasTriedGoogleViewer: (x: boolean) => void;
  hasTriedPublicUrl: boolean;
  setHasTriedPublicUrl: (x: boolean) => void;
}) {
  // Main checkFile function, extracted logic from the original
  const checkFile = useCallback(async (path?: string) => {
    const filePath = path || storagePath;
    handleOnline();
    setFileExists(false);

    if (!filePath) { setPreviewError("No file path provided"); return; }

    try {
      if (lastErrorType === "auth" || attemptCount > 2) {
        try { await checkAndRefreshToken(); } catch {}
      }
      const parts = filePath.split("/");
      const fileName = parts.pop() || "";
      const folderPath = parts.join("/");
      const { data: fileList, error: listError } = await supabase
        .storage
        .from("documents")
        .list(folderPath, { limit: 100, search: fileName });
      if (listError) throw listError;
      const exists = !!fileList?.find(f => f.name.toLowerCase() === fileName.toLowerCase());
      setFileExists(exists);
      if (!exists) { setPreviewError("File not found in storage"); return; }

      const publicUrlData = supabase.storage.from("documents").getPublicUrl(filePath);
      const publicUrl = publicUrlData?.data?.publicUrl;
      if (setFileType) setFileType(detectFileType(fileName));
      setIsExcelFile(isExcelFile(fileName));

      const { data: urlData, error: urlError } = await supabase
        .storage
        .from("documents")
        .createSignedUrl(filePath, 3600);
      if (urlError) {
        if (publicUrl) {
          setFileUrl(publicUrl);
          setPreviewError(null);
          resetRetries();
          return;
        }
        throw urlError;
      }
      setFileUrl(urlData?.signedUrl || null);
      setPreviewError(null);
      resetRetries();
      setHasTriedTokenRefresh(false);
      setHasTriedGoogleViewer(false);
      setHasTriedPublicUrl(false);
    } catch (err: any) {
      // Delegate error handling
      const publicUrlData = supabase.storage.from("documents").getPublicUrl(filePath);
      const publicUrl = publicUrlData?.data?.publicUrl;
      handleFileCheckError(err, publicUrl);
    }
    // eslint-disable-next-line
  }, [storagePath, attemptCount, lastErrorType, handleOnline, setFileExists,
      setFileUrl, setIsExcelFile, setPreviewError, setFileType,
      resetRetries, setHasTriedTokenRefresh, setHasTriedGoogleViewer, setHasTriedPublicUrl]);

  // This will be composed in the top-level hook, error handler must be injected!
  const handleFileCheckError = useCallback(async (error: any, publicUrl?: string | null) => {
    setFileUrl(null);
    const errorMsg = error?.message?.toLowerCase() || '';
    const isNetworkError = errorMsg.includes('network') || errorMsg.includes('fetch');
    const isAuthError = errorMsg.includes('token') || errorMsg.includes('auth') || errorMsg.includes('jwt');
    const isNotFoundError = errorMsg.includes('not found') || errorMsg.includes('404');
    const isCorsError = errorMsg.includes('cors') || errorMsg.includes('origin');
    if (isNetworkError) {
      handleOffline();
      setPreviewError('Network error while loading document. Retrying when connection improves...');
    } else if (isAuthError && !hasTriedTokenRefresh) {
      setPreviewError('Authentication error. Refreshing credentials...');
      setHasTriedTokenRefresh(true);
      try { await checkAndRefreshToken(); setTimeout(() => checkFile(), 1000); return; } catch {}
    } else if (isNotFoundError) {
      setPreviewError('Document not found in storage');
    } else if (isCorsError) {
      setPreviewError('Cross-origin error. Trying alternative method...');
    } else {
      setPreviewError(`Error loading document: ${error.message || 'Unknown error'}`);
    }
    if (publicUrl && !hasTriedPublicUrl) {
      setPreviewError('Trying public URL fallback...');
      setHasTriedPublicUrl(true);
      setFileUrl(publicUrl);
      return;
    }
    if (!hasTriedGoogleViewer) {
      setPreviewError('Trying Google Docs viewer fallback...');
      setHasTriedGoogleViewer(true);
      if (publicUrl) {
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(publicUrl)}&embedded=true`;
        setFileUrl(googleDocsUrl);
        return;
      }
    }
    if (shouldRetry()) {
      const delay = getRetryDelay();
      setTimeout(() => checkFile(), delay);
    } else {
      setPreviewError('Failed to load document after multiple attempts');
    }
    incrementAttempt(error);
  }, [hasTriedGoogleViewer, hasTriedPublicUrl, hasTriedTokenRefresh, shouldRetry, getRetryDelay, setPreviewError, setFileUrl, handleOffline, incrementAttempt, setHasTriedGoogleViewer, setHasTriedPublicUrl, setHasTriedTokenRefresh, checkFile]);

  return { checkFile, handleFileCheckError };
}

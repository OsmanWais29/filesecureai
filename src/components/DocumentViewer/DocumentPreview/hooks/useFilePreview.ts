
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';

interface FilePreviewProps {
  storagePath: string;
  setFileExists: (exists: boolean) => void;
  setFileUrl: (url: string | null) => void;
  setIsExcelFile: (isExcel: boolean) => void;
  setPreviewError: (error: string | null) => void;
  setFileType: (type: string | null) => void;
}

export const useFilePreview = ({
  storagePath,
  setFileExists,
  setFileUrl,
  setIsExcelFile,
  setPreviewError,
  setFileType
}: FilePreviewProps) => {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasFileLoadStarted, setHasFileLoadStarted] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>({});

  const getFileTypeFromPath = (path: string): { type: string; isExcel: boolean } => {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const isExcel = ['xls', 'xlsx', 'csv'].includes(extension);
    
    let type = 'application/octet-stream'; // Default type
    
    if (extension === 'pdf') type = 'application/pdf';
    else if (extension === 'doc' || extension === 'docx') type = 'application/msword';
    else if (extension === 'xls' || extension === 'xlsx') type = 'application/vnd.ms-excel';
    else if (extension === 'csv') type = 'text/csv';
    else if (extension === 'txt') type = 'text/plain';
    else if (extension === 'jpg' || extension === 'jpeg') type = 'image/jpeg';
    else if (extension === 'png') type = 'image/png';
    
    return { type, isExcel };
  };

  const checkFile = useCallback(async () => {
    if (!storagePath) {
      console.log("No storage path provided for file check");
      return;
    }

    setHasFileLoadStarted(true);
    setAttemptCount(prev => prev + 1);
    
    try {
      console.log(`Checking file: ${storagePath}, attempt #${attemptCount + 1}`);
      
      // Check network status
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      if (!navigator.onLine) {
        setPreviewError("You appear to be offline. Please check your internet connection.");
        return;
      }

      // For simplicity and reliability, let's try direct download URL first
      const { data: publicUrl } = supabase
        .storage
        .from('documents')
        .getPublicUrl(storagePath);
      
      if (publicUrl?.publicUrl) {
        console.log("Using public URL:", publicUrl.publicUrl);
        
        // Determine file type information
        const { type, isExcel } = getFileTypeFromPath(storagePath);
        setFileType(type);
        setIsExcelFile(isExcel);
        
        setFileExists(true);
        setFileUrl(publicUrl.publicUrl);
        setPreviewError(null);
        return;
      }
      
      // Fallback to signed URL if public URL doesn't work
      const { data: signedURL, error: signedURLError } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry
      
      if (signedURLError || !signedURL?.signedUrl) {
        console.error("Error creating signed URL:", signedURLError);
        
        setDiagnostics({
          ...diagnostics,
          signedURLError,
          storagePath
        });
        
        throw new Error(`Failed to create URL for document: ${signedURLError?.message || "Unknown error"}`);
      }
      
      // Success! We have a valid signed URL
      console.log("Successfully created signed URL");
      
      // Determine file type information
      const { type, isExcel } = getFileTypeFromPath(storagePath);
      setFileType(type);
      setIsExcelFile(isExcel);
      
      setFileExists(true);
      setFileUrl(signedURL.signedUrl);
      setPreviewError(null);
    } catch (error: any) {
      console.error("File preview error:", error.message);
      setPreviewError(`Error loading file: ${error.message}`);
      setFileUrl(null);
      setFileExists(false);
    }
  }, [storagePath, attemptCount, diagnostics, setFileUrl, setFileExists, setIsExcelFile, setPreviewError, setFileType]);

  useEffect(() => {
    if (storagePath && !hasFileLoadStarted) {
      console.log("Storage path changed, checking file:", storagePath);
      checkFile();
    }
    
    // Add network online/offline event listeners
    const handleOnline = () => {
      console.log("Network is online");
      setNetworkStatus('online');
      if (storagePath && !hasFileLoadStarted) {
        checkFile();
      }
    };
    
    const handleOffline = () => {
      console.log("Network is offline");
      setNetworkStatus('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [storagePath, checkFile, hasFileLoadStarted]);

  const resetRetries = useCallback(() => {
    setAttemptCount(0);
    setHasFileLoadStarted(false);
  }, []);
  
  const forceRefresh = useCallback(async (): Promise<void> => {
    resetRetries();
    await checkFile();
    return Promise.resolve();
  }, [resetRetries, checkFile]);

  return { 
    checkFile, 
    networkStatus, 
    attemptCount,
    hasFileLoadStarted,
    resetRetries,
    forceRefresh,
    diagnostics
  };
};

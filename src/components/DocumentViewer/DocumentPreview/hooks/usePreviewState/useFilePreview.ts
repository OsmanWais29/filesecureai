
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

  // Helper function to determine file type from the path
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

  // Function to check if the file exists and generate a URL
  const checkFile = useCallback(async () => {
    if (!storagePath) {
      console.log("No storage path provided for file check");
      setPreviewError("No storage path provided");
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
      
      // Determine file type information before any storage operations
      const { type, isExcel } = getFileTypeFromPath(storagePath);
      setFileType(type);
      setIsExcelFile(isExcel);

      // First approach: Try to get public URL
      try {
        console.log("Attempting to get public URL directly...");
        const { data: publicUrlData } = supabase
          .storage
          .from('documents')
          .getPublicUrl(storagePath);
          
        if (publicUrlData?.publicUrl) {
          console.log("Public URL available:", publicUrlData.publicUrl);
          setFileExists(true);
          setFileUrl(publicUrlData.publicUrl);
          setPreviewError(null);
          return;
        }
      } catch (err) {
        console.log("Public URL method failed, trying signed URL...");
      }
      
      // Second approach: Try signed URL
      try {
        console.log("Attempting to create signed URL...");
        const { data: signedURLData, error: signedURLError } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry
        
        if (signedURLError) {
          throw signedURLError;
        }
        
        if (signedURLData?.signedUrl) {
          console.log("Signed URL created successfully");
          setFileExists(true);
          setFileUrl(signedURLData.signedUrl);
          setPreviewError(null);
          return;
        }
      } catch (err) {
        console.log("Signed URL method failed, trying download URL...");
      }
      
      // Third approach: Try download URL
      try {
        console.log("Attempting to get download URL...");
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('documents')
          .download(storagePath);
        
        if (downloadError) {
          throw downloadError;
        }
        
        if (fileData) {
          const objectUrl = URL.createObjectURL(fileData);
          console.log("File downloaded and object URL created");
          setFileExists(true);
          setFileUrl(objectUrl);
          setPreviewError(null);
          return;
        }
      } catch (err) {
        console.log("Download method failed");
      }
      
      // If we get here, all approaches have failed
      setDiagnostics({
        ...diagnostics,
        storagePath,
        attempts: attemptCount + 1
      });
      
      throw new Error(`Unable to access file in storage: ${storagePath}`);
    } catch (error: any) {
      console.error("File preview error:", error.message);
      setPreviewError(`Error loading file: ${error.message}`);
      setFileUrl(null);
      setFileExists(false);
      
      // Add diagnostic information for debugging
      setDiagnostics({
        ...diagnostics,
        lastError: error.message,
        storagePath,
        attempts: attemptCount + 1
      });
    }
  }, [storagePath, attemptCount, diagnostics, setFileUrl, setFileExists, setIsExcelFile, setPreviewError, setFileType]);

  // Run file check when storage path changes
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
  
  // Modified to return a Promise<void> for consistency
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

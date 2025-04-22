
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useNetworkMonitor } from './useNetworkMonitor';
import { useRetryStrategy } from './useRetryStrategy';

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
  const { networkStatus, handleOnline, handleOffline } = useNetworkMonitor();
  const { 
    attemptCount, 
    incrementAttempt, 
    resetAttempts, 
    shouldRetry,
    getRetryDelay,
    lastAttempt,
    setLastAttempt
  } = useRetryStrategy();

  // Handle errors during file checking
  const handleFileCheckError = useCallback((error: any, publicUrl?: string | null) => {
    console.error('Error checking file:', error);
    setFileUrl(null);
    
    // Handle network-related errors specially
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      handleOffline();
      setPreviewError('Network error while loading document. Please check your connection.');
    } else if (error.message?.includes('permission') || error.message?.includes('auth')) {
      setPreviewError('Permission denied. You may not have access to this document.');
    } else if (!publicUrl) {
      setPreviewError('Document not found or unable to generate URL.');
    } else {
      setPreviewError(error.message || 'An unknown error occurred while loading the document.');
    }
    
    setFileExists(false);
    incrementAttempt();
  }, [handleOffline, incrementAttempt, setFileExists, setFileUrl, setPreviewError]);

  // Check if the file exists and get its URL
  const checkFile = useCallback(async (path?: string) => {
    setHasFileLoadStarted(true);
    const filePath = path || storagePath;
    
    if (!filePath) {
      setPreviewError('No file path provided');
      setFileExists(false);
      return;
    }
    
    try {
      // Mark as online since we're making a request
      handleOnline();
      
      // Extract file name and path parts
      const pathParts = filePath.split('/');
      const fileName = pathParts.pop() || '';
      const folderPath = pathParts.join('/');
      
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
      
      // Check if we found our file
      const fileExists = fileList && fileList.some(file => 
        file.name.toLowerCase() === fileName.toLowerCase()
      );
      
      setFileExists(fileExists);
      
      if (!fileExists) {
        setPreviewError('File not found');
        return;
      }
      
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
      
      // Get a signed URL for the file
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60); // 1 hour expiry
        
      if (urlError) {
        throw urlError;
      }
      
      setFileUrl(urlData?.signedUrl || null);
      
      // Clear any previous errors if successful
      setPreviewError(null);
      resetAttempts();
      
    } catch (error) {
      handleFileCheckError(error);
    }
  }, [
    storagePath, 
    setFileExists, 
    setFileUrl, 
    setIsExcelFile, 
    setPreviewError,
    setFileType,
    handleOnline,
    handleFileCheckError,
    resetAttempts
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
    
    if (networkStatus === 'offline' && shouldRetry(attemptCount)) {
      const delay = getRetryDelay(attemptCount);
      console.log(`Network offline, retrying in ${delay}ms (attempt ${attemptCount})`);
      
      retryTimeout = setTimeout(() => {
        console.log('Retrying file check...');
        checkFile();
        setLastAttempt(new Date());
      }, delay);
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [networkStatus, attemptCount, shouldRetry, getRetryDelay, checkFile, setLastAttempt]);

  return {
    checkFile,
    handleFileCheckError,
    networkStatus,
    attemptCount,
    hasFileLoadStarted,
    resetRetries: resetAttempts
  };
}

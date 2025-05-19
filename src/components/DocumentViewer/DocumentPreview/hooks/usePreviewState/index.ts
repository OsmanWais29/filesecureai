import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useDocumentAnalysis } from './useDocumentAnalysis';
import { useFileChecker } from './useFileChecker';
import { useNetworkResilience } from './useNetworkResilience';
import { useAnalysisInitialization } from './useAnalysisInitialization';
import { useTimeTracker } from './useTimeTracker';
import { Session } from '@supabase/supabase-js';
import { PreviewState } from '../types';
import { logDocumentEvent } from '@/utils/debugMode';
import { useSessionContext } from '@/contexts/SessionContext';
import { useDocumentTitle } from './useDocumentTitle';
import { useDocumentType } from './useDocumentType';

interface UsePreviewStateParams {
  documentId: string;
  storagePath: string;
  onAnalysisComplete?: () => void;
  bypassAnalysis?: boolean;
}

export const usePreviewState = ({
  documentId,
  storagePath,
  onAnalysisComplete,
  bypassAnalysis = false
}: UsePreviewStateParams): PreviewState => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [forceReloadCount, setForceReloadCount] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasFallbackToDirectUrl, setHasFallbackToDirectUrl] = useState(false);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const { refreshSession } = useSessionContext();

  const {
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    handleAnalyzeDocument
  } = useDocumentAnalysis(storagePath, onAnalysisComplete);

  const {
    checkFile,
    handleFileCheckError
  } = useFileChecker({
    setFileUrl,
    setIsLoading,
    setPreviewError,
    setHasFallbackToDirectUrl,
    setErrorDetails
  });

  const {
    isOnline,
    resetRetries,
    incrementRetry,
    shouldRetry
  } = useNetworkResilience();

  const {
    isAnalysisStuck,
    startTracking,
    stopTracking
  } = useTimeTracker();

  const {
    fileExists,
    isExcelFile,
    fileType
  } = useDocumentType(storagePath);

  const {
    title
  } = useDocumentTitle(documentId);

  const forceRefresh = useCallback(async (): Promise<void> => {
    setForceReloadCount(prevCount => prevCount + 1);
    return Promise.resolve();
  }, []);

  const handleFullRecovery = useCallback(async (): Promise<void> => {
    console.log('Attempting full recovery: refreshing session and retrying');
    toast({
      title: "Attempting Recovery",
      description: "Refreshing session and retrying document load...",
    });
    await refreshSession();
    setAttemptCount(0);
    setPreviewError(null);
    setIsLoading(true);
    setHasFallbackToDirectUrl(false);
    setForceReloadCount(prevCount => prevCount + 1);
    return Promise.resolve();
  }, [refreshSession, toast]);

  const loadFile = useCallback(async (useDirectLink = false) => {
    setIsLoading(true);
    setPreviewError(null);
    setErrorDetails(null);
    
    try {
      if (!isOnline) {
        throw new Error('Network is offline');
      }
      
      if (!storagePath) {
        throw new Error('No storage path provided');
      }
      
      const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents`;
      const fullPath = `${baseUrl}/${storagePath}`;
      const directUrl = `${baseUrl}/${storagePath}`;
      
      const url = useDirectLink ? directUrl : fullPath;
      
      logDocumentEvent(`Attempting to load file from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to load file: ${response.status} ${response.statusText}`, errorText);
        
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid session');
        } else if (response.status === 404) {
          throw new Error('File not found');
        } else {
          throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
        }
      }
      
      setFileUrl(url);
      resetRetries();
      return { success: true, url, method: useDirectLink ? 'direct' : 'supabase' };
      
    } catch (error: any) {
      console.error('Error loading file:', error);
      
      if (shouldRetry(error)) {
        incrementRetry();
      } else {
        setPreviewError(error.message || 'Failed to load document');
        setErrorDetails(error);
      }
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  }, [storagePath, session, isOnline, resetRetries, incrementRetry, shouldRetry]);

  useEffect(() => {
    if (previewError) {
      toast({
        variant: "destructive",
        title: "Preview Error",
        description: previewError,
      });
    }
  }, [previewError, toast]);

  useEffect(() => {
    if (storagePath && isOnline && fileExists) {
      loadFile();
    } else if (!isOnline) {
      setPreviewError('No internet connection');
    } else if (!fileExists) {
      setPreviewError('File does not exist');
    }
  }, [storagePath, isOnline, fileExists, loadFile]);

  const networkStatus = isOnline ? 'online' : 'offline';

  useAnalysisInitialization({
    storagePath,
    fileExists,
    isExcelFile,
    analyzing,
    error,
    setSession,
    handleAnalyzeDocument,
    setPreviewError,
    onAnalysisComplete,
    bypassAnalysis
  });

  // We need to redefine handleCheckFile to match the interface signature
  const handleCheckFile = useCallback(async (): Promise<void> => {
    if (storagePath) {
      await checkFile(storagePath);
    }
    return Promise.resolve();
  }, [storagePath, checkFile]);

  return {
    fileUrl,
    fileExists,
    isExcelFile,
    previewError,
    setPreviewError,
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    session,
    setSession,
    handleAnalyzeDocument: async () => {
      try {
        await handleAnalyzeDocument(session);
        return Promise.resolve();
      } catch (error) {
        console.error("Error analyzing document:", error);
        return Promise.resolve();
      }
    },
    isAnalysisStuck,
    checkFile: handleCheckFile, // Using our wrapper function
    isLoading,
    handleAnalysisRetry: () => {
      if (error) {
        setPreviewError(null);
        handleAnalyzeDocument(session);
      }
    },
    hasFallbackToDirectUrl,
    networkStatus,
    attemptCount,
    fileType,
    handleFullRecovery,
    forceRefresh,
    forceReload: forceReloadCount,
    errorDetails,
    // Add the missing properties
    isPdfFile: () => fileType === 'pdf',
    isDocFile: () => fileType === 'doc' || fileType === 'docx',
    isImageFile: () => ['jpg', 'jpeg', 'png', 'gif'].includes(fileType || ''),
    useDirectLink: hasFallbackToDirectUrl,
    zoomLevel: 100, // Default value
    onZoomIn: () => {}, // Placeholder
    onZoomOut: () => {}, // Placeholder
    onOpenInNewTab: () => {
      if (fileUrl) window.open(fileUrl, '_blank');
    },
    onDownload: () => {
      if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = documentId || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    onPrint: () => {
      if (fileUrl && iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.print();
      }
    },
    iframeRef
  };
};

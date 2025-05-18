import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useFileChecker } from "./useFileChecker";
import { useDocumentAI } from "./useDocumentAI";
import { useDocumentDetails } from "./useDocumentDetails";
import { useDocumentRealtime } from "./useDocumentRealtime";
import { startTiming, endTiming } from "@/utils/performanceMonitor";
import { supabase } from "@/lib/supabase";
import { DocumentRecord } from "./types";

export const usePreviewState = (documentId: string, storagePath: string) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [isExcelFile, setIsExcelFile] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasFallbackToDirectUrl, setHasFallbackToDirectUrl] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const attemptCountRef = useRef(0);
  const maxAttempts = 3;
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const [isAnalysisStuck, setIsAnalysisStuck] = useState({ stuck: false, minutesStuck: 0 });
  const [useDirectLink, setUseDirectLink] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Document AI analysis states
  const {
    analyzing,
    error,
    analysisStep,
    progress,
    handleAnalyzeDocument,
    handleAnalysisRetry,
    processingStage,
    documentRecord,
    fetchDocumentDetails,
    updateProcessingStep,
    checkProcessingError,
    getProcessingSteps
  } = useDocumentAI(documentId, storagePath);

  // File checking utilities
  const { checkFile, handleFileCheckError } = useFileChecker();

  // Realtime document updates
  useDocumentRealtime(documentId, fetchDocumentDetails);

  // Zoom functions
  const onZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const onZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 20));

  // Force refresh function
  const forceRefresh = async () => {
    setForceReload(prev => prev + 1);
  };

  // Open in new tab function
  const onOpenInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast({
        title: "Error",
        description: "No document URL available to open.",
        variant: "destructive"
      });
    }
  };

  // Download function
  const onDownload = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = documentId || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Error",
        description: "No document URL available to download.",
        variant: "destructive"
      });
    }
  };

  // Print function
  const onPrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.print();
    } else {
      toast({
        title: "Error",
        description: "Cannot print the document. Please ensure it's properly loaded.",
        variant: "destructive"
      });
    }
  };

  // Network status
  const networkStatus = isOnline ? "online" : "offline";

  // File extension checker
  const isFileType = (url: string | null, type: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith(`.${type}`);
  };

  // Check if the file is a PDF
  const isPdfFile = useCallback(() => isFileType(fileUrl, "pdf"), [fileUrl]);

  // Check if the file is a DOC
  const isDocFile = useCallback(() => isFileType(fileUrl, "doc") || isFileType(fileUrl, "docx"), [fileUrl]);

  // Check if the file is an image
  const isImageFile = useCallback(() => {
    return isFileType(fileUrl, "png") || isFileType(fileUrl, "jpg") || isFileType(fileUrl, "jpeg") || isFileType(fileUrl, "gif");
  }, [fileUrl]);

  // Check if the file is an excel file
  useEffect(() => {
    setIsExcelFile(isFileType(storagePath, "xlsx") || isFileType(storagePath, "xls"));
  }, [storagePath]);

  // Load the file URL
  const loadFileUrl = useCallback(async () => {
    setIsLoading(true);
    setPreviewError(null);
    attemptCountRef.current += 1;
    setAttemptCount(attemptCountRef.current);

    try {
      startTiming(`file-load-${documentId}`);
      const { data } = await supabase.storage.from('documents').getPublicUrl(storagePath);
      const publicUrl = data.publicUrl;

      if (!publicUrl) {
        throw new Error("Could not retrieve public URL");
      }

      setFileUrl(publicUrl);
      setFileType(storagePath.split('.').pop() || null);
      endTiming(`file-load-${documentId}`);
    } catch (err: any) {
      console.error("Error getting public URL:", err);
      handleFileCheckError(err, fileUrl);
      setPreviewError(err.message || "Failed to load document");
      setErrorDetails(err);
      endTiming(`file-load-${documentId}`);
    } finally {
      setIsLoading(false);
    }
  }, [storagePath, documentId, handleFileCheckError, fileUrl]);

  // Retry logic
  const handleFullRecovery = useCallback(async () => {
    setIsRetrying(true);
    setPreviewError(null);
    attemptCountRef.current = 0;
    setAttemptCount(attemptCountRef.current);

    try {
      await loadFileUrl();
      await checkFile(storagePath);
    } catch (error) {
      console.error("Full recovery failed:", error);
      setPreviewError("Full recovery failed. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  }, [loadFileUrl, checkFile, storagePath]);

  // Check if analysis is stuck
  const checkAnalysisStuck = useCallback(() => {
    if (!isAnalyzing || !analysisStep || !documentRecord) return { stuck: false, minutesStuck: 0 };
    
    let lastUpdateTime = new Date();
    if (documentRecord.updated_at) {
      // Safely handle the unknown type
      if (typeof documentRecord.updated_at === 'string' || documentRecord.updated_at instanceof Date) {
        lastUpdateTime = new Date(documentRecord.updated_at);
      }
    }
    
    const currentTime = new Date();
    const diffInMinutes = (currentTime.getTime() - lastUpdateTime.getTime()) / (1000 * 60);
    const stuck = diffInMinutes > 5;
    
    return {
      stuck,
      minutesStuck: Math.floor(diffInMinutes)
    };
  }, [isAnalyzing, analysisStep, documentRecord]);

  // Initial file check
  useEffect(() => {
    if (!storagePath) return;

    const performInitialCheck = async () => {
      setIsLoading(true);
      setPreviewError(null);
      attemptCountRef.current = 0;
      setAttemptCount(attemptCountRef.current);

      try {
        startTiming(`initial-check-${documentId}`);
        await checkFile(storagePath);
        await loadFileUrl();
        setHasFallbackToDirectUrl(false);
        endTiming(`initial-check-${documentId}`);
      } catch (checkError: any) {
        console.error("Initial check failed:", checkError);
        handleFileCheckError(checkError, fileUrl);
        setPreviewError(checkError.message || "Failed to load document");
        setErrorDetails(checkError);
        setHasFallbackToDirectUrl(true);
        endTiming(`initial-check-${documentId}`);
      } finally {
        setIsLoading(false);
      }
    };

    performInitialCheck();
  }, [storagePath, documentId, handleFileCheckError, loadFileUrl, fileUrl, checkFile]);

  // Check for stuck analysis
  useEffect(() => {
    const intervalId = setInterval(() => {
      const stuckInfo = checkAnalysisStuck();
      setIsAnalysisStuck(stuckInfo);
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [checkAnalysisStuck]);

  return {
    fileUrl,
    fileExists,
    isExcelFile,
    fileType,
    previewError,
    setPreviewError,
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    session,
    setSession,
    handleAnalyzeDocument,
    isAnalysisStuck,
    checkFile,
    isLoading,
    handleAnalysisRetry,
    hasFallbackToDirectUrl,
    networkStatus,
    attemptCount,
    fileType,
    handleFullRecovery,
    forceRefresh,
    errorDetails,
    isPdfFile,
    isDocFile,
    isImageFile,
    useDirectLink,
    setUseDirectLink,
    zoomLevel,
    setZoomLevel,
    onZoomIn,
    onZoomOut,
    onOpenInNewTab,
    onDownload,
    onPrint,
    iframeRef,
    forceReload,
    isRetrying,
    fetchDocumentDetails
  };
};

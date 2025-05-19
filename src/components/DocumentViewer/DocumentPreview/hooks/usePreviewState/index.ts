
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useFileChecker } from "../useFileChecker";
import { useDocumentAI } from "../useDocumentAI";
import { useDocumentDetails } from "../useDocumentDetails";
import { useDocumentRealtime } from "../useDocumentRealtime";
import { DocumentRecord } from "../types";
import { supabase } from "@/lib/supabase";

export const usePreviewState = (documentId: string, storagePath: string) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState<boolean>(false);
  const [isExcelFile, setIsExcelFile] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [session, setSession] = useState<any>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasFallbackToDirectUrl, setHasFallbackToDirectUrl] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const [fileType, setFileType] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const networkStatus = useNetworkStatus();
  const [isAnalysisStuck, setIsAnalysisStuck] = useState({ stuck: false, minutesStuck: 0 });
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [useDirectLink, setUseDirectLink] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Get file checker utilities
  const { checkFile, handleFileCheckError } = useFileChecker();
  
  // Get document AI utilities
  const documentAI = useDocumentAI(documentId, storagePath);
  
  // Setup document realtime updates
  useDocumentRealtime(documentId, documentAI.fetchDocumentDetails);
  
  useEffect(() => {
    if (documentAI.documentRecord) {
      setDocumentRecord(documentAI.documentRecord);
    }
  }, [documentAI.documentRecord]);
  
  useEffect(() => {
    if (documentAI.error) {
      setError(documentAI.error);
    }
  }, [documentAI.error]);
  
  useEffect(() => {
    if (documentAI.analysisStep) {
      setAnalysisStep(documentAI.analysisStep);
    }
  }, [documentAI.analysisStep]);
  
  useEffect(() => {
    setAnalyzing(documentAI.analyzing);
  }, [documentAI.analyzing]);
  
  useEffect(() => {
    if (documentAI.progress) {
      setProgress(documentAI.progress);
    }
  }, [documentAI.progress]);

  // Zoom functions
  const onZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const onZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 20));

  // Force refresh function
  const forceRefresh = async () => {
    setForceReload(prev => prev + 1);
    return Promise.resolve();
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

  // Check analysis stuck status
  const checkAnalysisStuck = useCallback(() => {
    if (!analyzing || !analysisStep || !documentRecord) return { stuck: false, minutesStuck: 0 };
    
    let lastUpdateTime = new Date();
    if (documentRecord.updated_at) {
      // Safely handle the unknown type
      if (typeof documentRecord.updated_at === 'string') {
        lastUpdateTime = new Date(documentRecord.updated_at);
      }
    }
    
    const currentTime = new Date();
    const diffInMinutes = (currentTime.getTime() - lastUpdateTime.getTime()) / (1000 * 60);
    const stuck = diffInMinutes > 2;
    return { stuck, minutesStuck: Math.floor(diffInMinutes) };
  }, [analyzing, analysisStep, documentRecord]);

  useEffect(() => {
    const result = checkAnalysisStuck();
    setIsAnalysisStuck(result);
  }, [checkAnalysisStuck]);

  // Full recovery function
  const handleFullRecovery = async () => {
    console.log("Attempting full recovery: clearing all states and retrying.");
    setAnalyzing(false);
    setAnalysisStep(null);
    setProgress(0);
    setError(null);
    setPreviewError(null);
    setAttemptCount(0);
    setHasFallbackToDirectUrl(false);
    setForceReload((prev) => prev + 1);
    setFileExists(false);
    setFileUrl(null);
    setIsExcelFile(false);
    setFileType(null);
    setErrorDetails(null);
    
    if (storagePath) {
      try {
        const exists = await checkFile(storagePath);
        setFileExists(exists);
        
        if (exists) {
          const { data } = supabase.storage.from('documents').getPublicUrl(storagePath);
          setFileUrl(data.publicUrl);
        }
      } catch (e) {
        handleFileCheckError(e, fileUrl);
      }
    }
    
    return Promise.resolve();
  };

  // Initial file check on mount
  useEffect(() => {
    const checkFileAndSetState = async () => {
      setIsLoading(true);
      try {
        if (storagePath) {
          const exists = await checkFile(storagePath);
          setFileExists(exists);
          
          if (exists) {
            const { data } = supabase.storage.from('documents').getPublicUrl(storagePath);
            setFileUrl(data.publicUrl);
            setFileType(storagePath.split('.').pop()?.toLowerCase() || null);
          }
        }
      } catch (e: any) {
        const errorMessage = handleFileCheckError(e, fileUrl);
        setPreviewError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    checkFileAndSetState();
  }, [storagePath, checkFile, handleFileCheckError, fileUrl]);

  // This is the handler that will use the documentAI's process document
  const handleAnalyzeDocument = () => {
    documentAI.handleAnalyzeDocument();
  };

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
    processingStage: documentAI.processingStage,
    session,
    setSession,
    handleAnalyzeDocument,
    isAnalysisStuck,
    checkFile,
    isLoading,
    handleAnalysisRetry: documentAI.handleAnalysisRetry,
    hasFallbackToDirectUrl,
    networkStatus: networkStatus.isOnline ? "online" : "offline",
    attemptCount,
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
    iframeRef
  };
};


import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useDocumentAnalysis } from "../hooks/useDocumentAnalysis";
import { useFilePreview } from "./usePreviewState/useFilePreview";
import { useAnalysisInitialization } from "./usePreviewState/useAnalysisInitialization";
import { toast } from "sonner";
import { refreshSession } from "@/hooks/useAuthState";
import { checkAndRefreshToken } from "@/utils/jwtMonitoring";

const usePreviewState = (
  storagePath: string,
  documentId: string = "",
  title: string = "Document Preview",
  onAnalysisComplete?: () => void,
  bypassAnalysis: boolean = false
) => {
  const [session, setSession] = useState<any>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isExcelFile, setIsExcelFile] = useState(false);
  const [loadRetries, setLoadRetries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFallbackToDirectUrl, setHasFallbackToDirectUrl] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);

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
    networkStatus, 
    attemptCount,
    hasFileLoadStarted,
    resetRetries,
    forceRefresh: filePreviewRefresh,  // Renamed to avoid collision
    diagnostics
  } = useFilePreview({
    storagePath,
    setFileExists,
    setFileUrl,
    setIsExcelFile, 
    setPreviewError,
    setFileType
  });

  useEffect(() => {
    if (fileUrl) {
      setIsLoading(false);
    }
  }, [fileUrl]);

  useEffect(() => {
    console.log(`Network status: ${networkStatus}, attempt count: ${attemptCount}`);
    
    setErrorDetails(diagnostics);
  }, [networkStatus, attemptCount, diagnostics]);

  useEffect(() => {
    if (previewError && loadRetries < 2 && !hasFallbackToDirectUrl) {
      console.log("Preview error detected, retrying with fallback strategies");
      
      setLoadRetries(prev => prev + 1);
      
      if (loadRetries === 1) {
        setHasFallbackToDirectUrl(true);
        console.log("Falling back to direct URL mode");
        
        checkAndRefreshToken().then(() => {
          console.log("Token refreshed, retrying direct URL");
          setTimeout(() => checkFile(), 1000);
        }).catch(err => {
          console.error("Failed to refresh token during fallback:", err);
          setTimeout(() => checkFile(), 1000);
        });
      }
    }
  }, [previewError, loadRetries, hasFallbackToDirectUrl, checkFile]);

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

  const [isAnalysisStuck, setIsAnalysisStuck] = useState<{
    stuck: boolean;
    minutesStuck: number;
  }>({
    stuck: false,
    minutesStuck: 0
  });

  useEffect(() => {
    if (!documentId) return;
    
    const checkStuckAnalysis = async () => {
      try {
        const { data } = await supabase
          .from('documents')
          .select('ai_processing_status, updated_at, metadata')
          .eq('id', documentId)
          .maybeSingle();
          
        if (data && data.ai_processing_status === 'processing') {
          const lastUpdateTime = new Date(data.updated_at);
          const minutesSinceUpdate = Math.floor((Date.now() - lastUpdateTime.getTime()) / (1000 * 60));
          
          if (minutesSinceUpdate > 10) {
            setPreviewError(`Analysis appears to be stuck (running for ${minutesSinceUpdate} minutes)`);
            
            setIsAnalysisStuck({
              stuck: true,
              minutesStuck: minutesSinceUpdate
            });
          }
        }
      } catch (error) {
        console.error("Error checking document status:", error);
      }
    };
    
    checkStuckAnalysis();
    const intervalId = setInterval(checkStuckAnalysis, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [documentId]);

  const handleFullRecovery = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setPreviewError("Performing full recovery...");
    
    try {
      const sessionRefreshed = await refreshSession();
      
      if (!sessionRefreshed) {
        throw new Error("Failed to refresh authentication session");
      }
      
      setPreviewError(null);
      setFileExists(false);
      setLoadRetries(0);
      resetRetries();
      
      setHasFallbackToDirectUrl(false);
      
      setIsAnalysisStuck({
        stuck: false,
        minutesStuck: 0
      });
      
      toast.success("Authentication refreshed, retrying document load...");
      await checkFile();
      
    } catch (error) {
      console.error("Recovery failed:", error);
      setPreviewError("Recovery failed. Please try again later.");
      setIsLoading(false);
    }
  }, [resetRetries, checkFile]);

  // Implement our own forceRefresh function that returns a Promise
  const forceRefresh = useCallback(async (): Promise<void> => {
    await checkFile();
    return Promise.resolve();
  }, [checkFile]);

  const handleAnalysisRetry = () => {
    setIsAnalysisStuck({
      stuck: false,
      minutesStuck: 0
    });
    
    setHasFallbackToDirectUrl(false);
    
    setPreviewError(null);
    setFileExists(false);
    setLoadRetries(0);
    resetRetries();
    
    refreshSession().then(() => {
      checkFile();
    }).catch(err => {
      console.error("Failed to refresh token during retry:", err);
      checkFile();
    });
  };

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
    forceRefresh,  // Return our own implementation, not the imported one
    errorDetails
  };
};

export default usePreviewState;

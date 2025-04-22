
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useDocumentAnalysis } from "../hooks/useDocumentAnalysis";
import { useFilePreview } from "./usePreviewState/useFilePreview";
import { useAnalysisInitialization } from "./usePreviewState/useAnalysisInitialization";

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

  const {
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    handleAnalyzeDocument
  } = useDocumentAnalysis(storagePath, onAnalysisComplete);

  // Use the FilePreview hook with the correct props shape
  const { 
    checkFile, 
    networkStatus, 
    attemptCount,
    hasFileLoadStarted,
    resetRetries
  } = useFilePreview({
    storagePath,
    setFileExists,
    setFileUrl,
    setIsExcelFile, 
    setPreviewError,
    setFileType
  });

  // When file information changes, update loading state
  useEffect(() => {
    if (fileUrl) {
      // If we have a file URL, we can consider loading complete
      setIsLoading(false);
    }
  }, [fileUrl]);

  // Log network status changes for debugging
  useEffect(() => {
    console.log(`Network status: ${networkStatus}, attempt count: ${attemptCount}`);
  }, [networkStatus, attemptCount]);

  // Auto-fallback to direct URL mode after multiple failures with preview
  useEffect(() => {
    if (previewError && loadRetries < 2 && !hasFallbackToDirectUrl) {
      console.log("Preview error detected, retrying with fallback strategies");
      
      // Increment retry counter 
      setLoadRetries(prev => prev + 1);
      
      // On second retry, fall back to direct URL
      if (loadRetries === 1) {
        setHasFallbackToDirectUrl(true);
        console.log("Falling back to direct URL mode");
        // Force an additional check
        setTimeout(() => checkFile(), 1000);
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

  // Add state for tracking stuck analysis
  const [isAnalysisStuck, setIsAnalysisStuck] = useState<{
    stuck: boolean;
    minutesStuck: number;
  }>({
    stuck: false,
    minutesStuck: 0
  });

  // Enhanced document status tracking
  useEffect(() => {
    if (!documentId) return;
    
    // Check if analysis is stuck
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
          
          // If analysis has been stuck for more than 10 minutes
          if (minutesSinceUpdate > 10) {
            setPreviewError(`Analysis appears to be stuck (running for ${minutesSinceUpdate} minutes)`);
            
            // Update local state to show retry button
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
    
    // Check once on load and then every 5 minutes
    checkStuckAnalysis();
    const intervalId = setInterval(checkStuckAnalysis, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [documentId]);

  // Handle analysis retry
  const handleAnalysisRetry = () => {
    // Reset stuck state
    setIsAnalysisStuck({
      stuck: false,
      minutesStuck: 0
    });
    
    // Reset fallback status
    setHasFallbackToDirectUrl(false);
    
    // Refresh document data
    setPreviewError(null);
    setFileExists(false);
    setLoadRetries(0);
    resetRetries();
    checkFile();
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
  };
};

export default usePreviewState;

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useFileChecker } from "./useFileChecker";
import { useDocumentAI } from "./useDocumentAI";
import { useDocumentDetails } from "../../hooks/useDocumentDetails";
import { useDocumentRealtime } from "../../hooks/useDocumentRealtime";
import { DocumentRecord } from "../types";

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
	const [isLoading, setIsLoading] = useState(false);
  const networkStatus = useNetworkStatus();
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);

  const { checkFile, handleFileCheckError } = useFileChecker();
  const {
    isProcessingComplete,
    checkProcessingError,
    getProcessingSteps,
    updateProcessingStep,
    handleAnalyzeDocument: handleAnalyze,
  } = useDocumentAI(documentId, storagePath);

  const { fetchDocumentDetails } = useDocumentDetails(documentId, {
    onSuccess: (data) => {
      setDocumentRecord(data);
    },
    onError: (err) => {
      console.error("Error fetching document details:", err);
      setError(`Failed to load document details: ${err.message}`);
    },
  });

  useDocumentRealtime(documentId, fetchDocumentDetails);

  const processingError = checkProcessingError();
  const processingSteps = getProcessingSteps();

  const handleAnalysisRetry = () => {
    setAnalyzing(false);
    setAnalysisStep(null);
    setProgress(0);
    setError(null);
    setPreviewError(null);
    setAttemptCount((prev) => prev + 1);
  };

  const forceRefresh = async () => {
    setForceReload((prev) => prev + 1);
  };

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
    await checkFile(storagePath);
  };

  const handleAnalyzeDocument = async () => {
    if (analyzing) {
      toast({
        title: "Analysis in Progress",
        description: "Document analysis is already running.",
      });
      return;
    }

    if (!fileExists) {
      toast({
        title: "File Not Found",
        description: "The document file does not exist or is not accessible.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setError(null);
    setPreviewError(null);
    setAttemptCount(0);

    try {
      await handleAnalyze(
        (step: string) => {
          setAnalysisStep(step);
          updateProcessingStep(step);
        },
        (prog: number) => {
          setProgress(prog);
        },
        (err: string) => {
          setError(err);
        },
        (details: any) => {
          setErrorDetails(details);
        }
      );
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze document.");
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "Failed to analyze document.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

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
    const stuck = diffInMinutes > 2;
    return { stuck, minutesStuck: Math.floor(diffInMinutes) };
  }, [isAnalyzing, analysisStep, documentRecord]);

  useEffect(() => {
    if (processingError) {
      setError(processingError);
      setAnalyzing(false);
      toast({
        variant: "destructive",
        title: "Document Processing Error",
        description: processingError,
      });
    }
  }, [processingError, toast]);

  useEffect(() => {
    if (isProcessingComplete) {
      setAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Document analysis completed successfully.",
      });
    }
  }, [isProcessingComplete, toast]);

  useEffect(() => {
    const checkFileAndSetState = async () => {
			setIsLoading(true);
      try {
        if (storagePath) {
          await checkFile(storagePath);
        }
      } catch (e: any) {
        handleFileCheckError(e, fileUrl);
      } finally {
				setIsLoading(false);
			}
    };

    checkFileAndSetState();
  }, [storagePath, checkFile, handleFileCheckError, fileUrl]);

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
    processingStage: documentRecord?.metadata?.processing_stage || null,
    session,
    setSession,
    handleAnalyzeDocument,
    isAnalysisStuck: checkAnalysisStuck(),
    checkFile,
    isLoading,
    handleAnalysisRetry,
    hasFallbackToDirectUrl,
    networkStatus: networkStatus.isOnline ? "online" : "offline",
    attemptCount,
    fileType,
    handleFullRecovery,
    forceRefresh,
    errorDetails,
  };
};

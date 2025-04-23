
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useDocumentAnalysis } from "./useDocumentAnalysis";

interface PreviewState {
  fileUrl: string | null;
  fileExists: boolean;
  previewError: string | null;
  isLoading: boolean;
  analyzing: boolean;
  error: string | null;
  analysisStep: string;
  progress: number;
  processingStage: string;
  session: any;
  setSession: (session: any) => void;
  handleAnalyzeDocument: (session: any) => void;
  handleAnalysisRetry: () => void;
  fileType: string | null;
}

const usePreviewState = (
  storagePath: string,
  documentId: string,
  title: string,
  onAnalysisComplete?: () => void,
  bypassAnalysis: boolean = false
): PreviewState => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileType, setFileType] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get document analysis state
  const {
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    handleAnalyzeDocument,
    setSession
  } = useDocumentAnalysis(storagePath, onAnalysisComplete);

  // Check file existence and get public URL
  const checkFile = useCallback(async () => {
    if (!storagePath) {
      setPreviewError("No document path provided");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Checking file: ${storagePath}`);
      
      // For the special Form 47 sample case, handle differently
      if (storagePath === "sample-documents/form-47-consumer-proposal.pdf") {
        const url = supabase.storage
          .from('documents')
          .getPublicUrl(storagePath).data.publicUrl;
        
        setFileUrl(url);
        setFileExists(true);
        setFileType('application/pdf');
        setPreviewError(null);
        setIsLoading(false);
        return;
      }
      
      // Try to get file metadata to determine if it exists
      const { data, error } = await supabase.storage
        .from('documents')
        .download(storagePath);

      if (error) {
        console.error("Error downloading file:", error);
        
        // Try to get public URL as a fallback
        try {
          const publicUrlData = supabase.storage
            .from('documents')
            .getPublicUrl(storagePath);
          
          const publicUrl = publicUrlData?.data?.publicUrl;
          
          if (publicUrl) {
            console.log("Using public URL as fallback");
            setFileUrl(publicUrl);
            setFileExists(true);
            
            // Try to determine file type from extension
            if (storagePath.toLowerCase().endsWith('.pdf')) {
              setFileType('application/pdf');
            } else {
              setFileType('application/octet-stream');
            }
            
            setPreviewError(null);
            setIsLoading(false);
            return;
          }
        } catch (fallbackError) {
          console.error("Fallback URL also failed:", fallbackError);
        }
        
        setFileExists(false);
        setPreviewError(`Document could not be loaded. ${error.message}`);
        setIsLoading(false);
        return;
      }

      // Get file type from the response
      const fileType = data.type;
      setFileType(fileType);

      // Get public URL for the file
      const url = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath).data.publicUrl;
      
      setFileUrl(url);
      setFileExists(true);
      setPreviewError(null);
      setIsLoading(false);
      
      console.log("File loaded successfully:", url);
    } catch (error) {
      console.error("Error checking file:", error);
      setFileExists(false);
      setPreviewError(`Failed to check document. ${error.message}`);
      setIsLoading(false);
    }
  }, [storagePath]);

  // Effect to check file when path changes
  useEffect(() => {
    if (storagePath) {
      setIsLoading(true);
      checkFile();
    } else {
      setFileExists(false);
      setPreviewError("No document path specified");
      setIsLoading(false);
    }
  }, [storagePath, checkFile]);

  // Handle retry
  const handleAnalysisRetry = useCallback(() => {
    setIsLoading(true);
    setPreviewError(null);
    setRetryCount(prev => prev + 1);
    checkFile();
  }, [checkFile]);

  return {
    fileUrl,
    fileExists,
    previewError,
    isLoading,
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    session: null,
    setSession,
    handleAnalyzeDocument,
    handleAnalysisRetry,
    fileType
  };
};

export default usePreviewState;

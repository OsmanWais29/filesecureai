
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisProcess } from "./analysisProcess/useAnalysisProcess";
import { AnalysisProcessProps } from "./analysisProcess/types";

export const useDocumentAnalysis = (storagePath: string, onAnalysisComplete?: () => void) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const { toast } = useToast();

  const analysisProcessProps: AnalysisProcessProps = {
    setAnalysisStep,
    setProgress,
    setError,
    setProcessingStage,
    toast,
    onAnalysisComplete
  };

  const { executeAnalysisProcess } = useAnalysisProcess(analysisProcessProps);

  const handleAnalyzeDocument = async (currentSession = session) => {
    setError(null);
    
    try {
      if (!currentSession) {
        // Attempt to get current session if not provided
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error("No active session found for document analysis:", sessionError);
          throw new Error('Authentication required: You must be logged in to analyze documents');
        }
        
        currentSession = sessionData.session;
      }

      setAnalyzing(true);
      
      await executeAnalysisProcess(storagePath, currentSession);
      
    } catch (error: any) {
      console.error('Document analysis failed:', error);
      setError(error.message || 'An unknown error occurred');
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze document"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Refresh the session state to ensure it's current
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setError("Authentication error: " + error.message);
          return;
        }
        
        setSession(data.session);
        
        // Check document status if we have a valid session
        if (data.session && storagePath && !analyzing) {
          try {
            const { data: document } = await supabase
              .from('documents')
              .select('ai_processing_status, metadata')
              .eq('storage_path', storagePath)
              .maybeSingle();
              
            if (document && 
               (document.ai_processing_status === 'pending' || 
                document.ai_processing_status === 'failed' ||
                (document.metadata && 
                 typeof document.metadata === 'object' && 
                 'processing_steps_completed' in document.metadata &&
                 Array.isArray(document.metadata.processing_steps_completed) &&
                 document.metadata.processing_steps_completed.length < 8))) {
              console.log('Document needs analysis, current status:', document.ai_processing_status);
              handleAnalyzeDocument(data.session);
            }
          } catch (err) {
            console.error('Error checking document status:', err);
          }
        }
      } catch (e) {
        console.error("Error in session check:", e);
      }
    };
    
    // Always check for a valid session on mount and when storagePath changes
    checkSession();
  }, [storagePath, analyzing]);

  return {
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    setSession,
    handleAnalyzeDocument
  };
};

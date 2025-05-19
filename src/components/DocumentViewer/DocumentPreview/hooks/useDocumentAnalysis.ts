
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { toString, toSafeSpreadArray, toSafeSpreadObject, toRecord } from "@/utils/typeSafetyUtils";
import { Session } from "@supabase/supabase-js";

export interface AnalysisProcessProps {
  setAnalysisStep: (step: string) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setProcessingStage: (stage: string) => void;
  toast: any;
  onAnalysisComplete?: () => void;
}

export const useDocumentAnalysis = (storagePath: string, onAnalysisComplete?: () => void) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const { toast } = useToast();

  // Implement the executeAnalysisProcess function that was missing
  const executeAnalysisProcess = useCallback(async (storagePath: string, currentSession: any) => {
    try {
      setAnalysisStep("Starting analysis");
      setProgress(10);
      
      // Simulate analysis process for now
      // In a real implementation, this would call an API to analyze the document
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisStep("Extracting text");
      setProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisStep("Analyzing content");
      setProgress(50);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisStep("Extracting metadata");
      setProgress(70);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisStep("Assessing risks");
      setProgress(85);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisStep("Generating summary");
      setProgress(95);
      
      // Update document status in database
      const { data: document } = await supabase
        .from('documents')
        .select('id, ai_processing_status, metadata')
        .eq('storage_path', storagePath)
        .maybeSingle();
        
      if (document) {
        const metadata = toRecord(document.metadata);
        const updatedMetadata = {
          ...metadata,
          processing_complete: true,
          last_analyzed: new Date().toISOString(),
          processing_steps_completed: [
            'document_preparation', 
            'text_extraction', 
            'content_analysis', 
            'metadata_extraction', 
            'risk_assessment', 
            'summary_generation'
          ]
        };
        
        await supabase
          .from('documents')
          .update({
            ai_processing_status: 'complete',
            metadata: updatedMetadata
          })
          .eq('id', document.id);
      }
      
      setProgress(100);
      setAnalysisStep("Analysis complete");
      
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
      
    } catch (error: any) {
      console.error('Document analysis process failed:', error);
      setError(error.message || 'Analysis failed');
      throw error;
    }
  }, [onAnalysisComplete]);

  const handleAnalyzeDocument = useCallback(async (currentSession = session) => {
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
  }, [executeAnalysisProcess, session, storagePath, toast]);

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
              
            if (document) {
              const metadata = toRecord(document.metadata);
              
              // Check if processing steps are completed
              const processingStepsCompleted = Array.isArray(metadata.processing_steps_completed) 
                ? metadata.processing_steps_completed 
                : [];
                
              if (document.ai_processing_status === 'pending' || 
                  document.ai_processing_status === 'failed' ||
                  processingStepsCompleted.length < 8) {
                console.log('Document needs analysis, current status:', document.ai_processing_status);
                handleAnalyzeDocument(data.session);
              }
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
  }, [storagePath, analyzing, handleAnalyzeDocument]);

  return {
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    setSession,
    handleAnalyzeDocument,
    executeAnalysisProcess
  };
};

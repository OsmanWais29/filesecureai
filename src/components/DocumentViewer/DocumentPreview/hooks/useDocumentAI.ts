
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DocumentRecord } from "./types";
import { toStringArray, safeObjectCast, toString } from "@/utils/typeSafetyUtils";

export const useDocumentAI = (documentId: string, storagePath: string) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const { toast } = useToast();

  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) return null;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
        
      if (error) {
        console.error("Error fetching document details:", error);
        return null;
      }
      
      if (data) {
        // Convert to proper DocumentRecord
        const record: DocumentRecord = {
          id: toString(data.id),
          title: toString(data.title),
          type: toString(data.type),
          storage_path: toString(data.storage_path),
          ai_processing_status: toString(data.ai_processing_status),
          metadata: safeObjectCast(data.metadata),
          updated_at: toString(data.updated_at),
          created_at: toString(data.created_at)
        };
        
        setDocumentRecord(record);
        return record;
      }
      
      return null;
    } catch (err) {
      console.error("Exception fetching document details:", err);
      return null;
    }
  }, [documentId]);

  const updateProcessingStep = async (step: string, progress: number, stage: string) => {
    setAnalysisStep(step);
    setProgress(progress);
    setProcessingStage(stage);
    
    // Also update the document record if available
    if (documentId) {
      try {
        await supabase
          .from('documents')
          .update({
            ai_processing_status: 'processing',
            metadata: {
              ...(documentRecord?.metadata || {}),
              current_step: step,
              progress,
              processing_stage: stage,
              updated_at: new Date().toISOString()
            }
          })
          .eq('id', documentId);
      } catch (err) {
        console.error("Error updating processing step:", err);
      }
    }
  };

  const checkProcessingError = async () => {
    if (!documentRecord) return false;
    
    // Check if there's an error in the metadata
    const metadata = documentRecord.metadata || {};
    if (metadata.error || metadata.processing_error) {
      setError(toString(metadata.error || metadata.processing_error));
      return true;
    }
    
    return false;
  };

  const getProcessingSteps = () => {
    if (!documentRecord?.metadata) return [];
    
    return toStringArray(documentRecord.metadata.processing_steps_completed || []);
  };

  const processDocument = async () => {
    setAnalyzing(true);
    setError(null);
    
    try {
      await updateProcessingStep('starting_analysis', 5, 'Initializing analysis');
      
      // Get the document record
      const document = await fetchDocumentDetails();
      if (!document) {
        throw new Error("Document not found");
      }
      
      // Download the document
      await updateProcessingStep('downloading_document', 10, 'Downloading document');
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(storagePath);
        
      if (downloadError) {
        throw new Error(`Error downloading document: ${downloadError.message}`);
      }
      
      // Process the document
      await updateProcessingStep('processing_document', 30, 'Processing document');
      
      // Simulate processing steps with delays
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateProcessingStep('extracting_text', 50, 'Extracting text');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateProcessingStep('analyzing_content', 70, 'Analyzing content');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await updateProcessingStep('generating_insights', 90, 'Generating insights');
      
      // Complete processing
      await updateProcessingStep('completed', 100, 'Analysis complete');
      
      // Update document record
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'complete',
          metadata: {
            ...(document.metadata || {}),
            analysis_completed: true,
            completed_at: new Date().toISOString(),
            processing_steps_completed: [
              ...(toStringArray(document.metadata?.processing_steps_completed)),
              'completed'
            ]
          }
        })
        .eq('id', documentId);
        
      toast({
        title: "Document Analysis Complete",
        description: "Document has been successfully analyzed",
      });
        
    } catch (error: any) {
      console.error("Document analysis failed:", error);
      setError(error.message || "An unknown error occurred");
      
      // Update document record with error
      if (documentRecord) {
        await supabase
          .from('documents')
          .update({
            ai_processing_status: 'failed',
            metadata: {
              ...(documentRecord.metadata || {}),
              error: error.message,
              error_at: new Date().toISOString()
            }
          })
          .eq('id', documentId);
      }
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Failed to analyze document"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalysisRetry = () => {
    if (error) {
      processDocument();
    }
  };

  return {
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    handleAnalysisRetry,
    processDocument,
    documentRecord,
    fetchDocumentDetails,
    updateProcessingStep,
    checkProcessingError,
    getProcessingSteps
  };
};

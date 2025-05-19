
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { safeObjectCast } from '@/utils/typeSafetyUtils';
import { Session } from '@supabase/supabase-js';

export interface DocumentAnalysisProps {
  storagePath: string;
  onAnalysisComplete?: () => void;
}

export interface DocumentAnalysisResult {
  analyzing: boolean;
  error: string | null;
  analysisStep: string;
  progress: number;
  processingStage: string | null;
  handleAnalyzeDocument: (session?: Session | null) => Promise<void>;
}

export const useDocumentAnalysis = (
  storagePath: string, 
  onAnalysisComplete?: () => void
): DocumentAnalysisResult => {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string | null>(null);

  const handleAnalyzeDocument = useCallback(async (session?: Session | null) => {
    try {
      setAnalyzing(true);
      setError(null);
      setProgress(0);
      setAnalysisStep("Starting analysis");
      
      // Get document ID from storage path
      const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('id, ai_processing_status')
        .eq('storage_path', storagePath)
        .maybeSingle();
        
      if (docError || !documents) {
        throw new Error(`Could not find document record: ${docError?.message || 'Unknown error'}`);
      }
      
      // Update document status to processing
      const documentId = documents.id;
      
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'processing',
          metadata: {
            processing_started: new Date().toISOString(),
            processing_stage: 'Initializing analysis',
            processing_steps_completed: []
          }
        })
        .eq('id', documentId);
      
      // Simulate analysis steps
      setAnalysisStep("Extracting text");
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStep("Analyzing content");
      setProgress(40);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStep("Extracting metadata");
      setProgress(60);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStep("Risk assessment");
      setProgress(80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStep("Generating summary");
      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mark as complete
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'complete',
          metadata: {
            processing_complete: true,
            processing_completed_at: new Date().toISOString(),
            processing_steps_completed: [
              'document_preparation',
              'text_extraction',
              'content_analysis',
              'metadata_extraction',
              'risk_assessment',
              'summary_generation'
            ]
          }
        })
        .eq('id', documentId);
        
      setProgress(100);
      setAnalysisStep("Analysis complete");
      
      if (onAnalysisComplete) {
        onAnalysisComplete();
      }
      
    } catch (err: any) {
      console.error('Error in document analysis:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setAnalyzing(false);
    }
  }, [storagePath, onAnalysisComplete]);

  return {
    analyzing,
    error,
    analysisStep,
    progress,
    processingStage,
    handleAnalyzeDocument
  };
};

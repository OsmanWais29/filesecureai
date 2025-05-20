
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AnalysisProcessContext } from './types';
import { useRiskAssessment } from './stages/riskAssessment';
import { toSafeSpreadObject } from '@/utils/typeSafetyUtils';

export const useAnalysisProcess = (documentId: string) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const [error, setError] = useState<null | string>(null);
  
  const initiateAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    setStep('Initializing');
    setProgress(0);
    
    try {
      // Get document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();
        
      if (docError || !document) {
        throw new Error(`Failed to fetch document: ${docError?.message || 'Not found'}`);
      }
      
      // Update status to processing
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'processing',
          metadata: {
            ...toSafeSpreadObject(document.metadata),
            processing_started: new Date().toISOString(),
            processing_stage: 'initialization'
          }
        })
        .eq('id', documentId);
        
      // Create analysis context
      const context: AnalysisProcessContext = {
        setAnalysisStep: setStep,
        setProgress,
        setError,
        setProcessingStage,
        toast,
        // If this document is a form, determine the type
        isForm47: document.metadata?.formType === 'form-47' || false,
        isForm76: document.metadata?.formType === 'form-76' || false,
        isForm31: document.metadata?.formType === 'form-31' || false
      };
      
      // Simulate document preparation
      setStep('Document preparation');
      setProgress(10);
      setProcessingStage('Preparation');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Run risk assessment
      setStep('Risk assessment');
      setProgress(60);
      await useRiskAssessment(context, document);
      
      // Complete processing
      setStep('Finalizing analysis');
      setProgress(100);
      
      // Update status to complete
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'complete',
          metadata: {
            ...toSafeSpreadObject(document.metadata),
            processing_complete: true,
            processing_completed_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);
      
      setAnalyzing(false);
      return { success: true };
    } catch (err: any) {
      console.error('Analysis process failed:', err);
      setError(err.message || 'Analysis failed');
      setAnalyzing(false);
      
      return { success: false, error: err.message };
    }
  }, [documentId, toast]);
  
  return {
    analyzing,
    step,
    progress,
    processingStage,
    error,
    initiateAnalysis
  };
};

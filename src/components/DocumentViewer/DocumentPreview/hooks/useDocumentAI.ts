
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DocumentRecord } from './types';

export const useDocumentAI = (documentId: string, storagePath?: string) => {
  const [documentRecord, setDocumentRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  // Check document status
  const checkDocumentStatus = useCallback(async () => {
    if (!documentId) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (error: any) {
      console.error('Error checking document status:', error);
      return null;
    }
  }, [documentId]);

  // Check if processing is complete
  const checkProcessingComplete = useCallback(() => {
    if (!documentRecord) return false;
    return documentRecord.ai_processing_status === 'completed' || 
           documentRecord.ai_processing_status === 'complete';
  }, [documentRecord]);

  // Check for processing errors
  const checkProcessingError = useCallback(() => {
    if (!documentRecord) return '';
    return documentRecord.ai_processing_status === 'failed' ? 
           (documentRecord.metadata?.processing_error || 'Analysis failed') : '';
  }, [documentRecord]);

  // Get processing steps
  const getProcessingSteps = useCallback(() => {
    if (!documentRecord || !documentRecord.metadata) return [];
    return documentRecord.metadata.processing_steps_completed || [];
  }, [documentRecord]);

  // Update processing step
  const updateProcessingStep = useCallback(async (step: string) => {
    if (!documentId) return;

    try {
      const { data: currentDoc } = await supabase
        .from('documents')
        .select('metadata')
        .eq('id', documentId)
        .single();

      if (!currentDoc) return;

      const updatedMetadata = {
        ...currentDoc.metadata,
        processing_stage: step,
        processing_steps_completed: [
          ...(currentDoc.metadata?.processing_steps_completed || []),
          step
        ]
      };

      await supabase
        .from('documents')
        .update({ metadata: updatedMetadata })
        .eq('id', documentId);

    } catch (error) {
      console.error('Error updating processing step:', error);
    }
  }, [documentId]);

  // Process document
  const processDocument = async () => {
    if (isProcessing) {
      console.log('Document analysis already in progress');
      return false;
    }

    setIsProcessing(true);
    setProgress(5);
    setAnalysisStatus('Initializing document analysis...');
    setAnalysisStep('document_initialization');
    setError('');

    try {
      // Simulate document analysis progress
      await simulateDocumentAnalysis();
      
      // Update document status to completed
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'completed',
          metadata: {
            ...documentRecord?.metadata,
            processing_complete: true,
            processing_stage: 'completed',
            last_analyzed: new Date().toISOString()
          }
        })
        .eq('id', documentId);
      
      setProgress(100);
      setAnalysisStatus('Analysis complete');
      setIsProcessing(false);
      
      // Refresh document data
      const updatedDoc = await checkDocumentStatus();
      if (updatedDoc) setDocumentRecord(updatedDoc);
      
      return true;
    } catch (err: any) {
      console.error('Error processing document:', err);
      setError(err.message || 'Failed to process document');
      setIsProcessing(false);
      
      // Update document status to failed
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'failed',
          metadata: {
            ...documentRecord?.metadata,
            processing_error: err.message || 'Unknown error occurred'
          }
        })
        .eq('id', documentId);
      
      return false;
    }
  };

  // Simulate document analysis progress
  const simulateDocumentAnalysis = async () => {
    const stages = [
      { step: 'document_ingestion', status: 'Ingesting document...', progress: 15 },
      { step: 'document_classification', status: 'Classifying document...', progress: 30 },
      { step: 'data_extraction', status: 'Extracting document data...', progress: 45 },
      { step: 'risk_assessment', status: 'Performing risk assessment...', progress: 60 },
      { step: 'issue_prioritization', status: 'Prioritizing issues...', progress: 75 },
      { step: 'collaboration_setup', status: 'Setting up collaboration tasks...', progress: 90 }
    ];
    
    for (const stage of stages) {
      setProgress(stage.progress);
      setAnalysisStatus(stage.status);
      setAnalysisStep(stage.step);
      await updateProcessingStep(stage.step);
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Handle analysis retry
  const handleAnalysisRetry = () => {
    setRetryCount(prev => prev + 1);
    setError('');
    processDocument();
  };

  return {
    documentRecord,
    isLoading,
    error,
    isProcessing,
    progress,
    analysisStatus,
    analysisStep,
    retryCount,
    checkDocumentStatus,
    processDocument,
    checkProcessingComplete,
    checkProcessingError,
    getProcessingSteps,
    updateProcessingStep,
    handleAnalysisRetry
  };
};

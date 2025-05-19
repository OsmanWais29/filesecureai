
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DocumentRecord, DocumentAIProps, DocumentAIResult } from "./types";

export const useDocumentAI = (documentId: string, storagePath: string): DocumentAIResult => {
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord>({
    id: documentId,
    title: '',
    metadata: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [analysisStep, setAnalysisStep] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch document details
  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) return null;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
        
      if (error) {
        console.error('Error fetching document:', error.message);
        setError(error.message);
        return null;
      }
      
      if (!data) {
        console.warn('Document not found:', documentId);
        return null;
      }
      
      // Create a properly typed document record
      const record: DocumentRecord = {
        id: data.id,
        title: data.title || '',
        metadata: data.metadata || {},
        ai_processing_status: data.ai_processing_status,
        storage_path: data.storage_path,
        updated_at: data.updated_at,
      };
      
      setDocumentRecord(record);
      
      // Check processing status
      if (data.ai_processing_status === 'processing') {
        setAnalyzing(true);
        updateAnalysisStatus(data);
      } else if (data.ai_processing_status === 'complete' || data.ai_processing_status === 'completed') {
        setAnalyzing(false);
        setProgress(100);
      }
      
      return record;
    } catch (err) {
      console.error('Error in fetchDocumentDetails:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  // Check document status
  const checkDocumentStatus = useCallback(async () => {
    try {
      return await fetchDocumentDetails();
    } catch (err) {
      console.error('Error checking document status:', err);
      return null;
    }
  }, [fetchDocumentDetails]);

  // Update analysis status from document
  const updateAnalysisStatus = useCallback((document: any) => {
    if (!document || !document.metadata) return;
    
    // Handle metadata with proper type checking
    const metadata = document.metadata;
    const processingStage = metadata?.processing_stage || 'Initializing...';
    setProcessingStage(processingStage);
    setAnalysisStatus(processingStage);
    
    // Calculate progress based on steps completed
    const completedSteps = Array.isArray(metadata?.processing_steps_completed) 
      ? metadata.processing_steps_completed.length 
      : 0;
      
    const totalSteps = 8;
    const calculatedProgress = Math.min(Math.round((completedSteps / totalSteps) * 100), 100);
    setProgress(calculatedProgress);
    
    // Check if processing is complete
    if (document.ai_processing_status === 'complete' || document.ai_processing_status === 'completed') {
      setAnalyzing(false);
      setProgress(100);
      setAnalysisStatus('Analysis complete');
    }
  }, []);

  // Process the document
  const processDocument = async (): Promise<boolean> => {
    try {
      setAnalyzing(true);
      setAnalysisStatus('Initializing analysis...');
      setProgress(0);
      setError('');
      
      // Update document status to processing
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          ai_processing_status: 'processing',
          metadata: {
            ...documentRecord.metadata,
            processing_started: new Date().toISOString(),
            processing_stage: 'Initializing analysis',
            processing_steps_completed: []
          }
        })
        .eq('id', documentId);
        
      if (updateError) {
        throw new Error(`Failed to update document status: ${updateError.message}`);
      }
      
      // Process the document by triggering edge function
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(storagePath);
        
      if (fileError) {
        throw new Error(`Failed to download document: ${fileError.message}`);
      }
      
      // Get document title for context
      const { data: document } = await supabase
        .from('documents')
        .select('title')
        .eq('id', documentId)
        .single();
      
      // Determine form type from title if available
      let formType = null;
      if (document?.title) {
        const title = document.title.toLowerCase();
        if (title.includes('form 31') || title.includes('proof of claim')) {
          formType = 'form-31';
        } else if (title.includes('form 47') || title.includes('consumer proposal')) {
          formType = 'form-47';
        }
      }
      
      const textContent = await fileData.text();
      
      // Call the process-ai-request function
      const { data, error: aiError } = await supabase.functions.invoke('process-ai-request', {
        body: {
          message: textContent.substring(0, 100000), // Limit text size
          documentId,
          module: 'document-analysis',
          formType,
          title: document?.title,
          debug: true
        }
      });
      
      if (aiError) {
        throw new Error(`Analysis failed: ${aiError.message}`);
      }
      
      // Update progress after successful processing
      setProgress(100);
      setAnalysisStatus('Analysis complete');
      
      // Refresh document details
      await fetchDocumentDetails();
      
      toast({
        title: "Analysis complete",
        description: "Document has been successfully analyzed"
      });
      
      setAnalyzing(false);
      return true;
    } catch (err: any) {
      console.error('Error processing document:', err);
      
      setError(err.message || 'An unknown error occurred');
      setAnalyzing(false);
      
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err.message || "Failed to analyze document"
      });
      
      return false;
    }
  };

  // Retry analysis
  const handleAnalysisRetry = async () => {
    setRetryCount(prev => prev + 1);
    await processDocument();
  };

  // Check for processing errors
  const checkProcessingError = async (): Promise<string | null> => {
    if (!documentRecord) return null;
    
    // Check for errors in metadata
    return documentRecord.metadata?.processing_error || null;
  };

  // Get processing steps
  const getProcessingSteps = async (): Promise<string[]> => {
    if (!documentRecord || !documentRecord.metadata) return [];
    
    return Array.isArray(documentRecord.metadata.processing_steps_completed) 
      ? documentRecord.metadata.processing_steps_completed 
      : [];
  };

  // Update processing step
  const updateProcessingStep = async (step: string) => {
    if (!documentId) return;
    
    try {
      const currentSteps = Array.isArray(documentRecord.metadata?.processing_steps_completed)
        ? documentRecord.metadata.processing_steps_completed
        : [];
        
      await supabase
        .from('documents')
        .update({
          metadata: {
            ...documentRecord.metadata,
            processing_stage: step,
            processing_steps_completed: [...currentSteps, step]
          }
        })
        .eq('id', documentId);
        
      setAnalysisStep(step);
    } catch (error) {
      console.error('Error updating processing step:', error);
    }
  };

  // Load document on mount
  useEffect(() => {
    if (documentId) {
      fetchDocumentDetails();
    }
  }, [documentId, fetchDocumentDetails]);

  // Subscribe to document updates
  useEffect(() => {
    if (!documentId) return;
    
    const channel = supabase
      .channel(`document_updates_${documentId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'documents',
        filter: `id=eq.${documentId}`
      }, (payload) => {
        if (payload.new) {
          updateAnalysisStatus(payload.new);
          
          // If analysis is complete, update the document record
          if (payload.new.ai_processing_status === 'complete' || 
              payload.new.ai_processing_status === 'completed') {
            setAnalyzing(false);
            setProgress(100);
            fetchDocumentDetails();
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, fetchDocumentDetails, updateAnalysisStatus]);

  return {
    documentRecord,
    isLoading,
    error,
    analyzing,
    progress,
    analysisStatus,
    analysisStep,
    retryCount,
    processingStage,
    processDocument,
    handleAnalysisRetry,
    checkDocumentStatus,
    fetchDocumentDetails,
    checkProcessingError,
    getProcessingSteps,
    updateProcessingStep
  };
};

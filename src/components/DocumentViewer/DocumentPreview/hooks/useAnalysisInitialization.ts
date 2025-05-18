
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentRecord } from './types';

export const useAnalysisInitialization = (documentId: string, storagePath: string) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const fetchDocumentRecord = useCallback(async () => {
    if (!documentId) return null;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (error) throw error;
      setDocumentRecord(data);
      return data;
    } catch (error) {
      console.error('Error fetching document record:', error);
      return null;
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocumentRecord();
  }, [fetchDocumentRecord]);

  const getProcessingSteps = useCallback(() => {
    if (!documentRecord || !documentRecord.metadata) return [];
    
    const metadata = documentRecord.metadata;
    if (typeof metadata === 'object' && 'processing_steps_completed' in metadata) {
      return metadata.processing_steps_completed as string[] || [];
    }
    return [];
  }, [documentRecord]);

  const initializeDocumentAnalysis = useCallback(async () => {
    setIsInitializing(true);

    try {
      await fetchDocumentRecord();
      const initialSteps = ['document_preparation', 'text_extraction'];
      setProcessingSteps(initialSteps);
      setIsInitializing(false);
    } catch (error) {
      console.error('Error initializing document analysis:', error);
      setIsInitializing(false);
    }
  }, [fetchDocumentRecord]);

  const initializeProcessingSteps = useCallback(async () => {
    try {
      const initialSteps = ['extract_text', 'analyze_content', 'extract_metadata', 'assess_risks', 'generate_summary'];
      setProcessingSteps(initialSteps);
      return initialSteps;
    } catch (error) {
      console.error('Error initializing processing steps:', error);
      return [];
    }
  }, []);

  return {
    isInitializing,
    initializeDocumentAnalysis,
    documentRecord,
    getProcessingSteps,
    processingSteps,
    setProcessingSteps,
    initializeProcessingSteps
  };
};

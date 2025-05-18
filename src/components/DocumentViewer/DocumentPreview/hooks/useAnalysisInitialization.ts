import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { useDocumentAI } from './useDocumentAI';
import { DocumentRecord } from '../types';

export const useAnalysisInitialization = (documentId: string, storage_path: string) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const { documentRecord, fetchDocument, getProcessingSteps } = useDocumentAI(documentId, storage_path);

  const initializeDocumentAnalysis = useCallback(async () => {
    if (!documentId || !storage_path) return;

    setIsInitializing(true);
    try {
      const { data: existingRecord, error: selectError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (selectError) {
        console.error("Error selecting document:", selectError);
        throw selectError;
      }

      if (!existingRecord) {
        console.log("Document does not exist, creating...");
        const { data, error } = await supabase
          .from('documents')
          .insert({
            id: documentId,
            storage_path: storage_path,
            ai_processing_status: 'pending'
          })
          .select();

        if (error) {
          console.error("Error creating document:", error);
          throw error;
        }
      } else {
        console.log("Document exists:", existingRecord);
      }

      await fetchDocument();
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsInitializing(false);
    }
  }, [documentId, storage_path, fetchDocument]);

  useEffect(() => {
    if (documentId && storage_path) {
      initializeDocumentAnalysis();
    }
  }, [documentId, storage_path, initializeDocumentAnalysis]);

  return {
    isInitializing,
    initializeDocumentAnalysis,
    documentRecord,
    getProcessingSteps
  };
};

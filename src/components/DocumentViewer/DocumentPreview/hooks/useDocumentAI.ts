import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DocumentRecord } from "../types";

export const useDocumentAI = (documentId: string, storage_path: string) => {
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocument = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, metadata, ai_processing_status, storage_path, updated_at')
        .eq('id', documentId)
        .single();

      if (error) {
        throw error;
      }

      setDocumentRecord(data);
    } catch (error: any) {
      console.error("Error fetching document:", error);
      setError(error.message || "Failed to fetch document");
      toast({
        variant: "destructive",
        title: "Error fetching document",
        description: error.message || "Failed to fetch document",
      });
    } finally {
      setIsLoading(false);
    }
  }, [documentId, toast]);

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId, fetchDocument]);

  const checkProcessingComplete = useCallback(() => {
    if (!documentRecord || !documentRecord.metadata) return false;
    return documentRecord.metadata.processing_complete === true;
  }, [documentRecord]);

  const checkProcessingError = useCallback(() => {
    if (!documentRecord || !documentRecord.metadata) return null;
    
    const metadata = documentRecord.metadata;
    // Safely access processing_error with type checking
    if (typeof metadata === 'object' && 'processing_error' in metadata) {
      return metadata.processing_error as string;
    }
    return null;
  }, [documentRecord]);

  const getProcessingSteps = useCallback(() => {
    if (!documentRecord || !documentRecord.metadata) return [];
    
    const metadata = documentRecord.metadata;
    // Safely access processing_steps_completed with type checking
    if (typeof metadata === 'object' && 'processing_steps_completed' in metadata) {
      return metadata.processing_steps_completed as string[] || [];
    }
    return [];
  }, [documentRecord]);

  const updateProcessingStep = useCallback(async (step: string) => {
    if (!documentId) return;

    try {
      if (!documentRecord) {
        console.warn("Document record is null, cannot update processing step.");
        return;
      }

      const metadata = documentRecord.metadata;
      
      // Safe type cast when using metadata
      if (metadata && typeof metadata === 'string') {
        // Handle string type correctly
        console.error("Metadata is string, expected object:", metadata);
        return;
      }

      const updatedMetadata = {
        ...metadata,
        processing_steps_completed: [...getProcessingSteps(), step],
      };

      const { error } = await supabase
        .from('documents')
        .update({ metadata: updatedMetadata })
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      setDocumentRecord((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          metadata: updatedMetadata,
        };
      });
    } catch (error) {
      console.error("Error updating processing step:", error);
    }
  }, [documentId, documentRecord]);

  return {
    documentRecord,
    isLoading,
    error,
    checkProcessingComplete,
    checkProcessingError,
    getProcessingSteps,
    updateProcessingStep,
  };
};

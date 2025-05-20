import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentDetails } from '../../types';
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@/hooks/use-session';
import { useNetworkStatus } from './useNetworkStatus';
import { toString } from '@/utils/typeSafetyUtils';

interface DocumentState {
  document: DocumentDetails | null;
  loading: boolean;
  loadingError: string | null;
  handleRefresh: () => void;
  isNetworkError: boolean;
}

export const useDocumentState = (documentId: string): DocumentState => {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { toast } = useToast();
  const { session } = useSession();
  const { isOnline } = useNetworkStatus();

  const fetchDocument = useCallback(async () => {
    setLoading(true);
    setLoadingError(null);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          comments (*),
          tasks (*),
          versions (*)
        `)
        .eq('id', documentId)
        .single();

      if (error) {
        console.error("Supabase error fetching document:", error);
        setLoadingError(`Failed to load document: ${error.message}`);
        return;
      }

      if (!data) {
        setLoadingError("Document not found");
        return;
      }

      // Format the document details
      const formattedDocument = formatDocumentDetail(data);
      setDocument(formattedDocument);
      console.log("Document loaded successfully:", formattedDocument.id);

    } catch (error: any) {
      console.error("Error fetching document:", error);
      setLoadingError(`Error loading document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId, fetchDocument, isOnline, session]);

  const handleRefresh = useCallback(() => {
    fetchDocument();
    toast({
      title: "Refreshing Document",
      description: "Document data is being reloaded.",
    });
  }, [fetchDocument, toast]);

  const isNetworkError = !isOnline && loading;

  return {
    document,
    loading,
    loadingError,
    handleRefresh,
    isNetworkError,
  };
};

const formatDocumentDetail = (document: any): DocumentDetails => {
  if (!document) {
    throw new Error("Document is null or undefined");
  }

  if (!document.id) {
    console.warn("Document ID is missing:", document);
    throw new Error("Document ID is missing");
  }

  const formattedId = toString(document.id);

  return {
    id: formattedId,
    title: document.title || 'Untitled Document',
    type: document.type || 'Unknown Type',
    storage_path: document.storage_path || '',
    created_at: document.created_at || new Date().toISOString(),
    updated_at: document.updated_at || new Date().toISOString(),
    analysis: document.analysis || [],
    comments: document.comments || [],
    tasks: document.tasks || [],
    versions: document.versions || [],
    metadata: document.metadata || {},
    parent_folder_id: document.parent_folder_id || null,
    ai_processing_status: document.ai_processing_status || 'not_started',
    ai_processing_stage: document.ai_processing_stage || null,
  };
};

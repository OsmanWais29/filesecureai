
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentRecord } from './types';

interface DocumentDetailsOptions {
  onSuccess?: (data: DocumentRecord) => void;
  onError?: (error: Error) => void;
}

export const useDocumentDetails = (documentId: string, options?: DocumentDetailsOptions) => {
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) {
      setError('No document ID provided');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to load document details');
      }

      if (!data) {
        throw new Error('Document not found');
      }

      // Type cast to DocumentRecord since we know the structure
      const typedData = data as unknown as DocumentRecord;
      setDocumentRecord(typedData);
      
      if (options?.onSuccess) {
        options.onSuccess(typedData);
      }
    } catch (err: any) {
      console.error('Error fetching document details:', err);
      setError(err.message || 'Failed to load document details');
      
      if (options?.onError) {
        options.onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [documentId, options]);

  useEffect(() => {
    fetchDocumentDetails();
  }, [fetchDocumentDetails]);

  return { 
    documentRecord,
    isLoading,
    error,
    fetchDocumentDetails
  };
};

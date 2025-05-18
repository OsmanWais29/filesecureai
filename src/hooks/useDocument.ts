
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useDocument = (documentId: string) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setDocument(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (error) throw error;
      setDocument(data);
    } catch (err: any) {
      console.error('Error fetching document:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const updateDocument = useCallback(async (updates: any) => {
    if (!documentId) return { success: false, error: 'No document ID provided' };

    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      setDocument(data);
      return { success: true, data };
    } catch (err: any) {
      console.error('Error updating document:', err);
      return { success: false, error: err.message };
    }
  }, [documentId]);

  return {
    document,
    loading,
    error,
    fetchDocument,
    updateDocument
  };
};

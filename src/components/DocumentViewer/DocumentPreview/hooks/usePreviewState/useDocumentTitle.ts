
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { safeString } from '@/utils/typeSafetyUtils';

export interface DocumentTitleResult {
  title: string | null;
  loading: boolean;
  error: string | null;
  fetchTitle: () => Promise<string | null>;
}

export const useDocumentTitle = (documentId: string): DocumentTitleResult => {
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTitle = useCallback(async (): Promise<string | null> => {
    if (!documentId) {
      setLoading(false);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('documents')
        .select('title')
        .eq('id', documentId)
        .maybeSingle();
        
      if (dbError) {
        setError(dbError.message);
        return null;
      }
      
      const docTitle = safeString(data?.title, null);
      setTitle(docTitle);
      return docTitle;
    } catch (err: any) {
      console.error('Error fetching document title:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (documentId) {
      fetchTitle();
    }
  }, [documentId, fetchTitle]);

  return {
    title,
    loading,
    error,
    fetchTitle
  };
};

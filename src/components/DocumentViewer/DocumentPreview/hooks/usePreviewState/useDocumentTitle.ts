
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toString } from '@/utils/typeSafetyUtils';

export const useDocumentTitle = (documentId: string) => {
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentTitle = useCallback(async () => {
    if (!documentId) {
      setTitle('');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('documents')
        .select('title')
        .eq('id', documentId)
        .single();
      
      if (error) {
        console.error('Error fetching document title:', error);
        setError(error.message);
        return;
      }
      
      setTitle(toString(data?.title));
    } catch (err: any) {
      console.error('Exception fetching document title:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocumentTitle();
  }, [fetchDocumentTitle]);

  return { title, isLoading, error, fetchDocumentTitle };
};

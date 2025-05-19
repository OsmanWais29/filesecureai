
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useDocumentTitle = (documentId: string) => {
  const [title, setTitle] = useState<string>('Document');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const fetchDocumentTitle = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('title')
          .eq('id', documentId)
          .single();

        if (error) {
          console.error('Error fetching document title:', error);
          setError(error.message);
        } else if (data) {
          setTitle(data.title || 'Document');
        }
      } catch (err) {
        console.error('Exception fetching document title:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentTitle();
  }, [documentId]);

  return {
    title,
    isLoading,
    error
  };
};

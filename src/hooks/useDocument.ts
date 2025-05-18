
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useDocument = (documentId: string) => {
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setIsLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();
          
        if (error) throw error;
        
        setDocument(data);
      } catch (err: any) {
        console.error('Error fetching document:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  return {
    document,
    isLoading,
    error
  };
};


import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toString, toSafeSpreadObject } from '@/utils/typeSafetyUtils';

export const useDocumentDetails = (documentId: string) => {
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [documentDetails, setDocumentDetails] = useState<any>(null);

  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) {
      setTitle('');
      setIsLoading(false);
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (error) {
        console.error('Error fetching document details:', error);
        setError(error.message);
        return null;
      }
      
      // Process document details
      if (data) {
        setDocumentDetails(data);
        setTitle(toString(data?.title));
      }
      
      return data;
    } catch (err: any) {
      console.error('Exception fetching document details:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);
  
  useEffect(() => {
    fetchDocumentDetails();
  }, [fetchDocumentDetails]);

  const updateDocumentTitle = useCallback(async (newTitle: string) => {
    if (!documentId) return false;
    
    try {
      const { error } = await supabase
        .from('documents')
        .update({ title: newTitle })
        .eq('id', documentId);
      
      if (error) {
        console.error('Error updating document title:', error);
        return false;
      }
      
      setTitle(newTitle);
      return true;
    } catch (err) {
      console.error('Exception updating document title:', err);
      return false;
    }
  }, [documentId]);

  return {
    title,
    isLoading,
    error,
    documentDetails,
    fetchDocumentDetails,
    updateDocumentTitle
  };
};


import { useState, useEffect } from 'react';
import { DocumentDetails } from '../types';
import { supabase } from '@/lib/supabase';

interface DocumentState {
  document: DocumentDetails | null;
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

export const useDocumentState = (documentId: string) => {
  const [state, setState] = useState<DocumentState>({
    document: null,
    loading: true,
    error: null,
    isOnline: navigator.onLine
  });

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (error) throw error;

        const documentDetails: DocumentDetails = {
          id: data.id,
          title: data.title || 'Untitled Document',
          type: data.type || 'document',
          storage_path: data.storage_path || '',
          created_at: data.created_at,
          updated_at: data.updated_at,
          metadata: data.metadata || {},
          parent_folder_id: data.parent_folder_id,
          ai_processing_status: data.ai_processing_status,
          ai_processing_stage: data.ai_processing_stage,
          deadlines: data.deadlines || [],
          analysis: [],
          comments: [],
          tasks: [],
          versions: []
        };

        setState(prev => ({ 
          ...prev, 
          document: documentDetails, 
          loading: false 
        }));
      } catch (err: any) {
        setState(prev => ({ 
          ...prev, 
          error: err.message, 
          loading: false 
        }));
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return state;
};


import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useDocumentRealtime = (
  documentId: string | null, 
  onDocumentUpdated: (() => void) | null
) => {
  const setupRealtimeSubscription = useCallback(() => {
    if (!documentId || !onDocumentUpdated) return;

    // Subscribe to changes on the document
    const channel = supabase
      .channel(`document_${documentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${documentId}`
        },
        (payload) => {
          console.log('Document updated:', payload);
          onDocumentUpdated();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'document_comments',
          filter: `document_id=eq.${documentId}`
        },
        (payload) => {
          console.log('New comment added:', payload);
          onDocumentUpdated();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'document_comments',
          filter: `document_id=eq.${documentId}`
        },
        (payload) => {
          console.log('Comment updated:', payload);
          onDocumentUpdated();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [documentId, onDocumentUpdated]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return () => {
      if (cleanup) cleanup();
    };
  }, [setupRealtimeSubscription]);
};

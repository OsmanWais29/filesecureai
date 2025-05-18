
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useDocumentRealtime = (
  documentId: string,
  onUpdate: () => void
) => {
  useEffect(() => {
    if (!documentId) return;

    // Subscribe to realtime changes for the document
    const channel = supabase
      .channel(`document-${documentId}`)
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
          onUpdate();
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [documentId, onUpdate]);
};

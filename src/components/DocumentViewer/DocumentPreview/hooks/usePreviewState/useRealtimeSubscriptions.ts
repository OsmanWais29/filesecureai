
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session  } from '@/lib/sfai/client';

interface RealtimeSubscriptionsProps {
  storagePath: string;
  setSession: (session: Session | null) => void;
  onAnalysisComplete?: () => void;
}

export const useRealtimeSubscriptions = ({
  storagePath,
  setSession,
  onAnalysisComplete
}: RealtimeSubscriptionsProps) => {
  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      console.log("Auth state changed in DocumentPreview:", updatedSession);
      setSession(updatedSession);
    });
    
    // Set up realtime subscription for document updates
    const channel = supabase
      .channel(`document_${storagePath}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `storage_path=eq.${storagePath}`
        },
        (payload) => {
          console.log('Document updated:', payload);
          if (payload.new.ai_processing_status === 'completed' && onAnalysisComplete) {
            onAnalysisComplete();
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [storagePath, setSession, onAnalysisComplete]);
};

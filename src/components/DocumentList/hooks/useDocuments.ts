
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Document } from "../types";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const analytics = useAnalytics();

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      analytics.trackEvent('documents_fetch_started');
      
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform data to match Document interface with proper type handling
      const transformedData: Document[] = data.map(item => ({
        id: item.id,
        title: item.title || 'Untitled Document', // Ensure title is always a string
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_folder: item.is_folder || false,
        folder_type: item.folder_type,
        parent_folder_id: item.parent_folder_id,
        storage_path: item.storage_path,
        metadata: typeof item.metadata === 'object' ? item.metadata : {}, // Ensure metadata is always an object
        type: item.type,
        size: item.size || 0,
      }));
      
      setDocuments(transformedData);
      analytics.trackEvent('documents_fetch_success', { count: transformedData.length });
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
      analytics.trackEvent('documents_fetch_error', { error: err instanceof Error ? err.message : 'Unknown error' });
      
      toast({
        variant: "destructive",
        title: "Error fetching documents",
        description: err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, [analytics, toast]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchDocuments();
    
    return () => {
      controller.abort();
    };
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments
  };
}

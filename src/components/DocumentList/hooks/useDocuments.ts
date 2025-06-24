
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
    // Prevent multiple simultaneous fetches
    if (isLoading) return;
    
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
      const transformedData: Document[] = (data || []).map(item => ({
        id: item.id,
        title: item.title || 'Untitled Document',
        created_at: item.created_at,
        updated_at: item.updated_at,
        is_folder: item.is_folder || false,
        folder_type: item.folder_type,
        parent_folder_id: item.parent_folder_id,
        storage_path: item.storage_path,
        metadata: typeof item.metadata === 'object' && item.metadata ? item.metadata : {},
        type: item.type,
        size: item.size || 0,
      }));
      
      setDocuments(transformedData);
      analytics.trackEvent('documents_fetch_success', { count: transformedData.length });
    } catch (err) {
      console.error('Error fetching documents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      setError(new Error(errorMessage));
      analytics.trackEvent('documents_fetch_error', { error: errorMessage });
      
      toast({
        variant: "destructive",
        title: "Error fetching documents",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [analytics, toast]); // Removed isLoading from dependencies to prevent infinite loop

  useEffect(() => {
    let isMounted = true;
    
    const loadDocuments = async () => {
      if (isMounted) {
        await fetchDocuments();
      }
    };
    
    loadDocuments();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once on mount

  const refetch = useCallback(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    refetch
  };
}

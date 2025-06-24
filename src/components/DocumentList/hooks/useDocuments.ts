
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
    console.log("🔍 Starting fetchDocuments...");
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Test Supabase connection first
      console.log("🔗 Testing Supabase connection...");
      const { error: connectionError } = await supabase
        .from('documents')
        .select('count(*)', { count: 'exact', head: true });
      
      if (connectionError) {
        console.error("❌ Supabase connection failed:", connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }
      
      console.log("✅ Supabase connection successful");
      
      analytics.trackEvent('documents_fetch_started');
      
      console.log("📊 Fetching documents from database...");
      const { data, error, count } = await supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .order('updated_at', { ascending: false });
      
      console.log("📋 Raw database response:", { data, error, count });
      
      if (error) {
        console.error("❌ Database query error:", error);
        throw error;
      }
      
      console.log(`📄 Found ${data?.length || 0} documents in database`);
      
      // Transform data to match Document interface with proper type handling
      const transformedData: Document[] = (data || []).map((item, index) => {
        console.log(`🔄 Transforming document ${index + 1}:`, item);
        return {
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
        };
      });
      
      console.log("✅ Transformed documents:", transformedData);
      setDocuments(transformedData);
      analytics.trackEvent('documents_fetch_success', { count: transformedData.length });
      
    } catch (err) {
      console.error('💥 Error in fetchDocuments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch documents';
      const errorObj = new Error(errorMessage);
      setError(errorObj);
      analytics.trackEvent('documents_fetch_error', { error: errorMessage });
      
      // Only show toast for non-connection errors to avoid spam
      if (!errorMessage.includes('Database connection failed')) {
        toast({
          variant: "destructive",
          title: "Error fetching documents",
          description: errorMessage,
        });
      }
    } finally {
      console.log("🏁 fetchDocuments completed, setting loading to false");
      setIsLoading(false);
    }
  }, [analytics, toast]);

  useEffect(() => {
    console.log("🚀 useDocuments useEffect triggered");
    let isMounted = true;
    
    const loadDocuments = async () => {
      if (isMounted) {
        console.log("📱 Component still mounted, calling fetchDocuments");
        await fetchDocuments();
      } else {
        console.log("🚫 Component unmounted, skipping fetchDocuments");
      }
    };
    
    loadDocuments();
    
    return () => {
      console.log("🧹 useDocuments cleanup - component unmounting");
      isMounted = false;
    };
  }, [fetchDocuments]);

  const refetch = useCallback(() => {
    console.log("🔄 Manual refetch triggered");
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    refetch
  };
}

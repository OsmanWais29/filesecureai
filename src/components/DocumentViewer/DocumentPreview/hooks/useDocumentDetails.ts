
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentDetails } from '../../types';
import { useToast } from '@/hooks/use-toast';

interface UseDocumentDetailsOptions {
  onSuccess?: (data: DocumentDetails) => void;
  onError?: (error: any) => void;
  includeTasks?: boolean;
  includeComments?: boolean;
  includeAnalysis?: boolean;
  includeVersions?: boolean;
}

export const useDocumentDetails = (documentId: string | undefined, options: UseDocumentDetailsOptions = {}) => {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const fetchDocumentDetails = useCallback(async () => {
    if (!documentId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch basic document details
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();
      
      if (docError) throw docError;
      
      const documentDetails: DocumentDetails = {
        ...docData,
        comments: [],
        tasks: [],
        analysis: [],
        versions: [],
        deadlines: []
      };
      
      // Fetch comments if requested
      if (options.includeComments) {
        const { data: comments, error: commentsError } = await supabase
          .from('document_comments')
          .select('*')
          .eq('document_id', documentId)
          .order('created_at', { ascending: false });
          
        if (!commentsError && comments) {
          documentDetails.comments = comments;
        }
      }
      
      // Fetch tasks if requested
      if (options.includeTasks) {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('document_id', documentId)
          .order('created_at', { ascending: false });
          
        if (!tasksError && tasks) {
          documentDetails.tasks = tasks;
        }
      }
      
      // Fetch analysis if requested
      if (options.includeAnalysis) {
        const { data: analysis, error: analysisError } = await supabase
          .from('document_analysis')
          .select('*')
          .eq('document_id', documentId)
          .order('created_at', { ascending: false });
          
        if (!analysisError && analysis) {
          documentDetails.analysis = analysis;
        }
      }
      
      // Fetch versions if requested
      if (options.includeVersions) {
        const { data: versions, error: versionsError } = await supabase
          .from('document_versions')
          .select('*')
          .eq('document_id', documentId)
          .order('version_number', { ascending: false });
          
        if (!versionsError && versions) {
          documentDetails.versions = versions;
        }
      }
      
      // Fetch deadlines from metadata
      if (docData.metadata && docData.metadata.deadlines) {
        documentDetails.deadlines = docData.metadata.deadlines;
      }
      
      setDocument(documentDetails);
      
      if (options.onSuccess) {
        options.onSuccess(documentDetails);
      }
      
    } catch (err: any) {
      console.error('Error fetching document details:', err);
      setError(err);
      
      toast({
        title: "Error",
        description: `Failed to load document details: ${err.message}`,
        variant: "destructive",
      });
      
      if (options.onError) {
        options.onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [documentId, options, toast]);

  useEffect(() => {
    if (documentId) {
      fetchDocumentDetails();
    }
  }, [documentId, fetchDocumentDetails]);

  return {
    document,
    isLoading,
    error,
    fetchDocumentDetails
  };
};

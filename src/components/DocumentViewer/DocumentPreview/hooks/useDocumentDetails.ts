
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Define proper interfaces for document-related data
interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  document_id: string;
  is_resolved?: boolean;
  parent_id?: string;
  mentions?: string[];
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status?: string;
  assigned_to?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
  severity?: string;
  document_id?: string;
}

interface AnalysisResult {
  id: string;
  content: any;
  document_id?: string;
  created_at?: string;
}

interface Version {
  id: string;
  version_number: number;
  storage_path: string;
  document_id: string;
  created_at?: string;
  created_by?: string;
  is_current?: boolean;
  description?: string;
}

export interface DocumentDetails {
  id: string;
  title: string;
  type?: string;
  created_at: string;
  updated_at: string;
  storage_path: string;
  metadata?: Record<string, any>;
  comments?: Comment[];
  tasks?: Task[];
  analysis?: AnalysisResult[];
  versions?: Version[];
  deadlines?: any[];
}

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
      
      if (!docData) {
        throw new Error('Document not found');
      }
      
      // Build complete document details
      const documentDetails: DocumentDetails = {
        id: docData.id,
        title: docData.title,
        type: docData.type || 'document',
        created_at: docData.created_at,
        updated_at: docData.updated_at,
        storage_path: docData.storage_path || '',
        metadata: docData.metadata || {},
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
          documentDetails.comments = comments as Comment[];
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
          documentDetails.tasks = tasks as Task[];
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
          documentDetails.analysis = analysis as AnalysisResult[];
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
          documentDetails.versions = versions as Version[];
        }
      }
      
      // Get deadlines from metadata if present
      const metadata = docData.metadata || {};
      if (metadata && Array.isArray(metadata.deadlines)) {
        documentDetails.deadlines = metadata.deadlines;
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

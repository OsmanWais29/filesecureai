
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { safeString, safeObjectCast, safeArrayCast } from '@/utils/typeSafetyUtils';

// Define proper interfaces for document-related data
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  document_id: string;
  is_resolved?: boolean;
  parent_id?: string;
  mentions?: string[];
}

export interface Task {
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

export interface AnalysisResult {
  id: string;
  content: any;
  document_id?: string;
  created_at?: string;
}

export interface Version {
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
  metadata?: Record<string, unknown>;
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
        id: safeString(docData.id, ''),
        title: safeString(docData.title, ''),
        type: safeString(docData.type, 'document'),
        created_at: safeString(docData.created_at, ''),
        updated_at: safeString(docData.updated_at, ''),
        storage_path: safeString(docData.storage_path, ''),
        metadata: safeObjectCast(docData.metadata),
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
          // Safely cast the comments data to the Comment type
          documentDetails.comments = safeArrayCast<Comment>(comments, (item: Record<string, unknown>) => ({
            id: safeString(item.id),
            content: safeString(item.content),
            user_id: safeString(item.user_id),
            created_at: safeString(item.created_at),
            document_id: safeString(item.document_id),
            is_resolved: item.is_resolved as boolean,
            parent_id: safeString(item.parent_id),
            mentions: safeArrayCast<string>(item.mentions)
          }));
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
          // Safely cast the tasks data to the Task type
          documentDetails.tasks = safeArrayCast<Task>(tasks, (item: Record<string, unknown>) => ({
            id: safeString(item.id),
            title: safeString(item.title),
            description: safeString(item.description),
            status: safeString(item.status),
            assigned_to: safeString(item.assigned_to),
            created_by: safeString(item.created_by),
            created_at: safeString(item.created_at),
            updated_at: safeString(item.updated_at),
            due_date: safeString(item.due_date),
            severity: safeString(item.severity),
            document_id: safeString(item.document_id)
          }));
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
          // Safely cast the analysis data to the AnalysisResult type
          documentDetails.analysis = safeArrayCast<AnalysisResult>(analysis, (item: Record<string, unknown>) => ({
            id: safeString(item.id),
            content: item.content,
            document_id: safeString(item.document_id),
            created_at: safeString(item.created_at)
          }));
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
          // Safely cast the versions data to the Version type
          documentDetails.versions = safeArrayCast<Version>(versions, (item: Record<string, unknown>) => ({
            id: safeString(item.id),
            version_number: Number(item.version_number || 0),
            storage_path: safeString(item.storage_path),
            document_id: safeString(item.document_id),
            created_at: safeString(item.created_at),
            created_by: safeString(item.created_by),
            is_current: Boolean(item.is_current),
            description: safeString(item.description)
          }));
        }
      }
      
      // Get deadlines from metadata if present
      const metadata = safeObjectCast(docData.metadata);
      if (metadata && Array.isArray(metadata.deadlines)) {
        documentDetails.deadlines = metadata.deadlines as any[];
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

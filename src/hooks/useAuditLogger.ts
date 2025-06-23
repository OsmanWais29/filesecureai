
import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface LogParams {
  action: string;
  documentId?: string;
  metadata?: Record<string, any>;
}

export const useAuditLogger = () => {
  const logAction = useCallback(async ({ action, documentId, metadata = {} }: LogParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Cannot log action: User not authenticated');
        return;
      }

      // Get client information for enhanced logging
      const clientInfo = {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...metadata
      };

      // Log to document_access_logs table
      const { error } = await supabase
        .from('document_access_logs')
        .insert({
          user_id: user.id,
          document_id: documentId,
          action,
          metadata: clientInfo,
          ip_address: null, // Will be populated by Supabase edge function if needed
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Failed to log action:', error);
        return;
      }

      // For sensitive actions, create additional audit entry
      if (['edit', 'delete', 'share'].includes(action)) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            document_id: documentId,
            action: `${action}_logged`,
            metadata: {
              ...clientInfo,
              security_level: 'high',
              requires_review: true
            }
          });
      }

    } catch (error) {
      console.error('Error in audit logging:', error);
      // Don't throw - audit logging should not break user functionality
    }
  }, []);

  // Specific logging functions for common actions
  const logView = useCallback((documentId: string, metadata?: Record<string, any>) => {
    return logAction({ action: 'view', documentId, metadata });
  }, [logAction]);

  const logEdit = useCallback((documentId: string, changes: Record<string, any>) => {
    return logAction({ 
      action: 'edit', 
      documentId, 
      metadata: { changes, edit_type: 'content' }
    });
  }, [logAction]);

  const logMetadataEdit = useCallback((documentId: string, field: string, oldValue: any, newValue: any) => {
    return logAction({ 
      action: 'edit', 
      documentId, 
      metadata: { 
        edit_type: 'metadata',
        field,
        old_value: oldValue,
        new_value: newValue
      }
    });
  }, [logAction]);

  const logTaskChange = useCallback((documentId: string, taskId: string, change: string) => {
    return logAction({ 
      action: 'task_change', 
      documentId, 
      metadata: { task_id: taskId, change }
    });
  }, [logAction]);

  const logComment = useCallback((documentId: string, commentId: string, action: 'add' | 'edit' | 'delete') => {
    return logAction({ 
      action: `comment_${action}`, 
      documentId, 
      metadata: { comment_id: commentId }
    });
  }, [logAction]);

  const logDownload = useCallback((documentId: string, metadata?: Record<string, any>) => {
    return logAction({ action: 'download', documentId, metadata });
  }, [logAction]);

  const logShare = useCallback((documentId: string, sharedWith: string[]) => {
    return logAction({ 
      action: 'share', 
      documentId, 
      metadata: { shared_with: sharedWith }
    });
  }, [logAction]);

  const logUpload = useCallback((documentId: string, metadata?: Record<string, any>) => {
    return logAction({ action: 'upload', documentId, metadata });
  }, [logAction]);

  return {
    logAction,
    logView,
    logEdit,
    logMetadataEdit,
    logTaskChange,
    logComment,
    logDownload,
    logShare,
    logUpload
  };
};

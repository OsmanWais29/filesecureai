
import { supabase } from '@/lib/supabase';

interface AuditLogData {
  documentId?: string;
  action: 'view' | 'download' | 'upload' | 'delete' | 'share' | 'edit';
  metadata?: Record<string, any>;
}

export const logDocumentAction = async ({
  documentId,
  action,
  metadata = {}
}: AuditLogData): Promise<void> => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('No authenticated user for audit log');
      return;
    }

    // Get client IP and user agent from browser if available
    const clientMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Insert audit log
    const { error } = await supabase
      .from('document_access_logs')
      .insert({
        user_id: user.id,
        document_id: documentId,
        action,
        metadata: clientMetadata
      });

    if (error) {
      console.error('Failed to log document action:', error);
    }
  } catch (error) {
    console.error('Error in audit logging:', error);
    // Don't throw - audit logging should not break user functionality
  }
};

// Helper functions for common audit actions
export const logDocumentView = (documentId: string, metadata?: Record<string, any>) => {
  return logDocumentAction({ documentId, action: 'view', metadata });
};

export const logDocumentDownload = (documentId: string, metadata?: Record<string, any>) => {
  return logDocumentAction({ documentId, action: 'download', metadata });
};

export const logDocumentUpload = (documentId: string, metadata?: Record<string, any>) => {
  return logDocumentAction({ documentId, action: 'upload', metadata });
};

export const logDocumentDelete = (documentId: string, metadata?: Record<string, any>) => {
  return logDocumentAction({ documentId, action: 'delete', metadata });
};

export const logDocumentShare = (documentId: string, metadata?: Record<string, any>) => {
  return logDocumentAction({ documentId, action: 'share', metadata });
};

export const logDocumentEdit = (documentId: string, metadata?: Record<string, any>) => {
  return logDocumentAction({ documentId, action: 'edit', metadata });
};

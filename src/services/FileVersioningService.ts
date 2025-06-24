
import { supabase } from '@/lib/supabase';

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  description: string;
  storagePath: string;
  fileSize: number;
  createdAt: string;
  createdBy: string;
  isCurrent: boolean;
  changeNotes?: string;
  metadata?: Record<string, any>;
}

export class FileVersioningService {
  static async createVersion(documentId: string, file: File, description: string) {
    try {
      // Get current version number
      const { data: versions } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Create new version record
      const { data: version, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: nextVersion,
          description,
          is_current: true,
          metadata: {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create version:', error);
        return null;
      }

      return version;
    } catch (error) {
      console.error('Version creation failed:', error);
      return null;
    }
  }

  static async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    try {
      const { data: versions, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Failed to get version history:', error);
        return [];
      }

      return versions?.map(v => ({
        id: v.id,
        documentId: v.document_id,
        versionNumber: v.version_number,
        description: v.description || '',
        storagePath: v.storage_path || '',
        fileSize: v.metadata?.file_size || 0,
        createdAt: v.created_at,
        createdBy: v.created_by || '',
        isCurrent: v.is_current || false,
        changeNotes: v.changes_summary,
        metadata: v.metadata
      })) || [];
    } catch (error) {
      console.error('Failed to get version history:', error);
      return [];
    }
  }

  static async switchToVersion(documentId: string, versionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, set all versions to not current
      const { error: updateError } = await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Set the selected version as current
      const { error: setCurrentError } = await supabase
        .from('document_versions')
        .update({ is_current: true })
        .eq('id', versionId);

      if (setCurrentError) {
        return { success: false, error: setCurrentError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to switch version:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteVersion(versionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if this is the current version
      const { data: version, error: fetchError } = await supabase
        .from('document_versions')
        .select('is_current, document_id')
        .eq('id', versionId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      if (version?.is_current) {
        return { success: false, error: 'Cannot delete the current version' };
      }

      // Delete the version
      const { error: deleteError } = await supabase
        .from('document_versions')
        .delete()
        .eq('id', versionId);

      if (deleteError) {
        return { success: false, error: deleteError.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to delete version:', error);
      return { success: false, error: error.message };
    }
  }
}

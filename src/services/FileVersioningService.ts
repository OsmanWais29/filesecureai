
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  storagePath: string;
  title: string;
  isCurrent: boolean;
  createdAt: string;
  createdBy: string;
  changeNotes?: string;
  fileSize: number;
}

export class FileVersioningService {
  /**
   * Create a new version of a document
   */
  static async createVersion(
    originalDocumentId: string,
    newFile: File,
    changeNotes?: string
  ): Promise<{ success: boolean; versionId?: string; error?: string }> {
    try {
      console.log('📝 Creating new document version:', originalDocumentId);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get original document
      const { data: originalDoc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', originalDocumentId)
        .single();

      if (docError || !originalDoc) {
        throw new Error('Original document not found');
      }

      // Get current version number
      const { data: existingVersions, error: versionError } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', originalDocumentId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionError) {
        throw new Error('Failed to get version history');
      }

      const nextVersionNumber = existingVersions && existingVersions.length > 0 
        ? existingVersions[0].version_number + 1 
        : 2; // Start at version 2 (original is version 1)

      // Upload new file
      const timestamp = new Date().getTime();
      const fileExt = newFile.name.split('.').pop();
      const newStoragePath = `versions/${originalDocumentId}/v${nextVersionNumber}_${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(newStoragePath, newFile);

      if (uploadError) {
        throw new Error(`Failed to upload new version: ${uploadError.message}`);
      }

      // Mark current version as not current
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', originalDocumentId)
        .eq('is_current', true);

      // Create version record
      const { data: newVersion, error: insertError } = await supabase
        .from('document_versions')
        .insert({
          document_id: originalDocumentId,
          version_number: nextVersionNumber,
          storage_path: newStoragePath,
          title: newFile.name,
          is_current: true,
          created_by: user.id,
          change_notes: changeNotes,
          file_size: newFile.size,
          metadata: {
            original_name: newFile.name,
            file_type: newFile.type,
            version_created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to create version record: ${insertError.message}`);
      }

      // Update main document record
      await supabase
        .from('documents')
        .update({
          storage_path: newStoragePath,
          title: newFile.name,
          size: newFile.size,
          updated_at: new Date().toISOString(),
          metadata: {
            ...originalDoc.metadata,
            current_version: nextVersionNumber,
            version_updated_at: new Date().toISOString()
          }
        })
        .eq('id', originalDocumentId);

      // Create initial version record for original if it doesn't exist
      const { data: originalVersion } = await supabase
        .from('document_versions')
        .select('id')
        .eq('document_id', originalDocumentId)
        .eq('version_number', 1)
        .single();

      if (!originalVersion) {
        await supabase
          .from('document_versions')
          .insert({
            document_id: originalDocumentId,
            version_number: 1,
            storage_path: originalDoc.storage_path,
            title: originalDoc.title,
            is_current: false,
            created_by: originalDoc.user_id,
            change_notes: 'Original version',
            file_size: originalDoc.size || 0,
            created_at: originalDoc.created_at
          });
      }

      toast.success('New version created', {
        description: `Version ${nextVersionNumber} of ${originalDoc.title}`
      });

      return { success: true, versionId: newVersion.id };

    } catch (error) {
      console.error('Failed to create document version:', error);
      toast.error('Failed to create version', {
        description: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all versions of a document
   */
  static async getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    try {
      const { data: versions, error } = await supabase
        .from('document_versions')
        .select(`
          id,
          document_id,
          version_number,
          storage_path,
          title,
          is_current,
          created_at,
          created_by,
          change_notes,
          file_size
        `)
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) {
        throw new Error(`Failed to get version history: ${error.message}`);
      }

      return versions || [];
    } catch (error) {
      console.error('Failed to get version history:', error);
      return [];
    }
  }

  /**
   * Switch to a specific version
   */
  static async switchToVersion(
    documentId: string, 
    versionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Switching document version:', documentId, versionId);

      // Get the target version
      const { data: targetVersion, error: versionError } = await supabase
        .from('document_versions')
        .select('*')
        .eq('id', versionId)
        .eq('document_id', documentId)
        .single();

      if (versionError || !targetVersion) {
        throw new Error('Version not found');
      }

      // Mark all versions as not current
      await supabase
        .from('document_versions')
        .update({ is_current: false })
        .eq('document_id', documentId);

      // Mark target version as current
      await supabase
        .from('document_versions')
        .update({ is_current: true })
        .eq('id', versionId);

      // Update main document record
      await supabase
        .from('documents')
        .update({
          storage_path: targetVersion.storage_path,
          title: targetVersion.title,
          size: targetVersion.file_size,
          updated_at: new Date().toISOString(),
          metadata: {
            current_version: targetVersion.version_number,
            switched_to_version_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);

      toast.success('Switched to version', {
        description: `Now viewing version ${targetVersion.version_number}`
      });

      return { success: true };

    } catch (error) {
      console.error('Failed to switch version:', error);
      toast.error('Failed to switch version', {
        description: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a specific version
   */
  static async deleteVersion(
    versionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get version details
      const { data: version, error: versionError } = await supabase
        .from('document_versions')
        .select('*')
        .eq('id', versionId)
        .single();

      if (versionError || !version) {
        throw new Error('Version not found');
      }

      if (version.is_current) {
        throw new Error('Cannot delete the current version');
      }

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([version.storage_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
      }

      // Delete version record
      const { error: deleteError } = await supabase
        .from('document_versions')
        .delete()
        .eq('id', versionId);

      if (deleteError) {
        throw new Error(`Failed to delete version: ${deleteError.message}`);
      }

      toast.success('Version deleted', {
        description: `Version ${version.version_number} has been removed`
      });

      return { success: true };

    } catch (error) {
      console.error('Failed to delete version:', error);
      toast.error('Failed to delete version', {
        description: error.message
      });
      return { success: false, error: error.message };
    }
  }
}

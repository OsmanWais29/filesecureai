
import { supabase } from '@/lib/supabase';

export interface DocumentVersion {
  id: string;
  version_number: number;
  storage_path: string;
  created_at: string;
  created_by: string;
  description: string;
  is_current: boolean;
  changes_summary?: string;
}

export const createDocumentVersion = async (
  documentId: string,
  file: File,
  userId: string,
  description: string = 'Updated document'
): Promise<{ success: boolean; versionId?: string }> => {
  try {
    // Get next version number
    const nextVersion = await getNextVersionNumber(documentId);
    
    // Upload new version to storage
    const fileExt = file.name.split('.').pop();
    const versionPath = `${userId}/${documentId}/v${nextVersion}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(versionPath, file);

    if (uploadError) throw uploadError;

    // Mark all previous versions as not current
    await supabase
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', documentId);

    // Create new version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersion,
        storage_path: versionPath,
        created_by: userId,
        description,
        is_current: true,
        changes_summary: generateChangesSummary(file)
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // Update main document to point to new version
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        storage_path: versionPath,
        updated_at: new Date().toISOString(),
        metadata: {
          current_version: nextVersion,
          last_updated_by: userId
        }
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return { success: true, versionId: versionData.id };
  } catch (error) {
    console.error('Error creating document version:', error);
    return { success: false };
  }
};

export const getDocumentVersions = async (documentId: string): Promise<DocumentVersion[]> => {
  try {
    const { data, error } = await supabase
      .from('document_versions')
      .select(`
        id,
        version_number,
        storage_path,
        created_at,
        created_by,
        description,
        is_current,
        changes_summary
      `)
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching document versions:', error);
    return [];
  }
};

export const restoreDocumentVersion = async (
  documentId: string,
  versionId: string
): Promise<{ success: boolean }> => {
  try {
    // Get the version details
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .select('storage_path')
      .eq('id', versionId)
      .single();

    if (versionError || !version) throw versionError;

    // Mark all versions as not current
    await supabase
      .from('document_versions')
      .update({ is_current: false })
      .eq('document_id', documentId);

    // Mark selected version as current
    await supabase
      .from('document_versions')
      .update({ is_current: true })
      .eq('id', versionId);

    // Update main document to point to restored version
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        storage_path: version.storage_path,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error restoring document version:', error);
    return { success: false };
  }
};

const getNextVersionNumber = async (documentId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('document_versions')
    .select('version_number')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return 1;
  }

  return data[0].version_number + 1;
};

const generateChangesSummary = (file: File): string => {
  return `Updated ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
};

export const getDocumentVersionUrl = async (storagePath: string): Promise<string | null> => {
  try {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting version URL:', error);
    return null;
  }
};

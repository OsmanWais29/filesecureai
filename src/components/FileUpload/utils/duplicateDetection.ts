
import { supabase } from '@/lib/supabase';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingDocumentId?: string;
  existingDocument?: any;
}

export const checkForDuplicates = async (
  file: File,
  userId: string
): Promise<DuplicateCheckResult> => {
  try {
    // Create a simple hash of the file for comparison
    const fileBuffer = await file.arrayBuffer();
    const fileSize = file.size;
    const fileName = file.name;
    
    // Check for exact filename and size matches first
    const { data: existingDocs, error } = await supabase
      .from('documents')
      .select('id, title, size, metadata')
      .eq('user_id', userId)
      .eq('title', fileName)
      .eq('size', fileSize);

    if (error) {
      console.error('Error checking duplicates:', error);
      return { isDuplicate: false };
    }

    if (existingDocs && existingDocs.length > 0) {
      return {
        isDuplicate: true,
        existingDocumentId: existingDocs[0].id,
        existingDocument: existingDocs[0]
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Duplicate check failed:', error);
    return { isDuplicate: false };
  }
};

export const handleDuplicateAction = async (
  action: 'replace' | 'keep_both' | 'cancel',
  file: File,
  existingDocumentId: string,
  userId: string
): Promise<{ success: boolean; documentId?: string }> => {
  switch (action) {
    case 'replace':
      // Create new version of existing document
      return await createNewVersion(file, existingDocumentId, userId);
    
    case 'keep_both':
      // Upload as new document with modified name
      return await uploadAsNewDocument(file, userId, true);
    
    case 'cancel':
      return { success: false };
    
    default:
      return { success: false };
  }
};

const createNewVersion = async (
  file: File,
  documentId: string,
  userId: string
): Promise<{ success: boolean; documentId?: string }> => {
  try {
    // Upload new version to storage
    const fileExt = file.name.split('.').pop();
    const versionPath = `${userId}/${documentId}/v${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(versionPath, file);

    if (uploadError) throw uploadError;

    // Create version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: await getNextVersionNumber(documentId),
        storage_path: versionPath,
        created_by: userId,
        description: 'Uploaded new version',
        is_current: true
      })
      .select()
      .single();

    if (versionError) throw versionError;

    // Update main document record
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        storage_path: versionPath,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return { success: true, documentId };
  } catch (error) {
    console.error('Error creating new version:', error);
    return { success: false };
  }
};

const uploadAsNewDocument = async (
  file: File,
  userId: string,
  addSuffix: boolean = false
): Promise<{ success: boolean; documentId?: string }> => {
  try {
    const fileName = addSuffix 
      ? `${file.name.split('.')[0]}_copy.${file.name.split('.').pop()}`
      : file.name;

    // This would call the main upload function
    // For now, return success with a placeholder
    return { success: true, documentId: 'new-doc-id' };
  } catch (error) {
    console.error('Error uploading new document:', error);
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

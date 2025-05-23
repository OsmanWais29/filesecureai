
import { supabase } from '@/lib/supabase';
import { safeStringCast } from '@/utils/typeGuards';

export const mergeClientFolders = async (
  sourceFolderId: string,
  targetFolderId: string
) => {
  try {
    // Get all documents in source folder
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('parent_folder_id', sourceFolderId);

    if (docsError) {
      throw docsError;
    }

    // Move documents to target folder
    if (documents && documents.length > 0) {
      const { error: moveError } = await supabase
        .from('documents')
        .update({ parent_folder_id: targetFolderId })
        .in('id', documents.map(doc => safeStringCast(doc.id)));

      if (moveError) {
        throw moveError;
      }
    }

    // Delete source folder
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', sourceFolderId);

    if (deleteError) {
      throw deleteError;
    }

    return {
      success: true,
      message: `Merged ${documents?.length || 0} documents successfully`
    };

  } catch (error) {
    console.error('Error merging client folders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

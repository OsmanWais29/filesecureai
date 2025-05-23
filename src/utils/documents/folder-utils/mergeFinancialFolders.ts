
import { supabase } from '@/lib/supabase';
import { safeStringCast } from '@/utils/typeGuards';

export const mergeFinancialFolders = async (
  sourceData: Record<string, any>,
  targetFolderId: string
) => {
  try {
    const clientName = safeStringCast(sourceData['client_name'] || '');
    const folderName = safeStringCast(sourceData['folder_name'] || '');
    
    if (!clientName || !folderName) {
      throw new Error('Missing required folder information');
    }

    // Update target folder with merged data
    const { error } = await supabase
      .from('documents')
      .update({
        title: folderName,
        metadata: {
          client_name: clientName,
          merged_at: new Date().toISOString(),
          source_data: sourceData
        }
      })
      .eq('id', targetFolderId);

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Financial folders merged successfully'
    };

  } catch (error) {
    console.error('Error merging financial folders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

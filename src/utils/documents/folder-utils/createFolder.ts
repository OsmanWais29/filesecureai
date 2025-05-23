
import { supabase } from '@/lib/supabase';
import { safeStringCast } from '@/utils/typeGuards';

export const createClientFolder = async (
  clientName: string,
  parentId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const folderData = {
      title: safeStringCast(clientName),
      is_folder: true,
      folder_type: 'client',
      parent_folder_id: parentId || null,
      user_id: user.id,
      metadata: {
        client_name: clientName,
        created_by: 'system',
        folder_purpose: 'client_documents'
      }
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(folderData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      folderId: safeStringCast(data?.id),
      message: 'Client folder created successfully'
    };

  } catch (error) {
    console.error('Error creating client folder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

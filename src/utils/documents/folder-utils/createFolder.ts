
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

export const createFolderIfNotExists = async (
  folderName: string,
  folderType: string = 'general',
  parentId?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if folder already exists
    const { data: existingFolder } = await supabase
      .from('documents')
      .select('id')
      .eq('title', folderName)
      .eq('is_folder', true)
      .eq('folder_type', folderType)
      .eq('user_id', user.id)
      .eq('parent_folder_id', parentId || null)
      .single();

    if (existingFolder) {
      return {
        success: true,
        folderId: safeStringCast(existingFolder.id),
        message: 'Folder already exists'
      };
    }

    // Create new folder
    const folderData = {
      title: safeStringCast(folderName),
      is_folder: true,
      folder_type: folderType,
      parent_folder_id: parentId || null,
      user_id: user.id,
      metadata: {
        folder_name: folderName,
        created_by: 'system',
        folder_purpose: folderType
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
      message: 'Folder created successfully'
    };

  } catch (error) {
    console.error('Error creating folder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};


import { supabase } from '@/lib/supabase';
import { FolderStructure } from '@/types/folders';
import { safeStringCast } from '@/utils/typeGuards';

export const createFolder = async (name: string, parentId?: string, folderType: string = 'folder'): Promise<FolderStructure> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const folder = {
      title: name,
      type: 'folder',
      user_id: user.id,
      parent_folder_id: parentId || null,
      is_folder: true,
      folder_type: folderType,
      metadata: { created_by: user.id }
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(folder)
      .select()
      .single();

    if (error) throw error;

    return {
      id: safeStringCast(data.id),
      name: safeStringCast(data.title),
      type: 'folder',
      level: 0,
      parent_id: data.parent_folder_id,
      is_folder: true,
      folder_type: safeStringCast(data.folder_type),
      metadata: data.metadata || {}
    };
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

export const getFolders = async (): Promise<FolderStructure[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_folder', true)
      .order('title');

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: safeStringCast(item.id),
      name: safeStringCast(item.title),
      type: 'folder',
      level: 0,
      parent_id: item.parent_folder_id,
      is_folder: true,
      folder_type: safeStringCast(item.folder_type),
      metadata: item.metadata || {}
    }));
  } catch (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
};

export const updateFolder = async (id: string, updates: Partial<FolderStructure>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({
        title: updates.name,
        folder_type: updates.folder_type,
        metadata: updates.metadata
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating folder:', error);
    throw error;
  }
};

export const deleteFolder = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

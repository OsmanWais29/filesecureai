
import { supabase } from '@/lib/supabase';
import { FolderStructure } from '@/types/folders';
import { safeStringCast } from '@/utils/typeGuards';

export interface CreateFolderRequest {
  name: string;
  type?: 'form' | 'document' | 'client' | 'folder' | 'estate';
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateFolderRequest {
  id: string;
  name?: string;
  metadata?: Record<string, any>;
}

export const folderService = {
  async createFolder(request: CreateFolderRequest): Promise<FolderStructure> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const folderData = {
        title: request.name,
        is_folder: true,
        folder_type: request.type || 'folder' as const,
        parent_folder_id: request.parentId || null,
        user_id: user.id,
        metadata: request.metadata || {}
      };

      const { data, error } = await supabase
        .from('documents')
        .insert(folderData)
        .select()
        .single();

      if (error) throw error;

      return {
        id: safeStringCast(data.id),
        name: safeStringCast(data.title),
        type: (data.folder_type as 'form' | 'document' | 'client' | 'folder' | 'estate') || 'folder',
        parentId: data.parent_folder_id ? safeStringCast(data.parent_folder_id) : undefined,
        children: [],
        metadata: data.metadata || {}
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  async updateFolder(request: UpdateFolderRequest): Promise<void> {
    try {
      const updateData: any = {};
      
      if (request.name) {
        updateData.title = request.name;
      }
      
      if (request.metadata) {
        updateData.metadata = request.metadata;
      }

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating folder:', error);
      throw error;
    }
  },

  async deleteFolder(folderId: string): Promise<void> {
    try {
      // First, check if folder has any children
      const { data: children, error: childrenError } = await supabase
        .from('documents')
        .select('id')
        .eq('parent_folder_id', folderId);

      if (childrenError) throw childrenError;

      if (children && children.length > 0) {
        throw new Error('Cannot delete folder that contains documents or subfolders');
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting folder:', error);
      throw error;
    }
  },

  async getFolders(parentId?: string): Promise<FolderStructure[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_folder', true);

      if (parentId) {
        query = query.eq('parent_folder_id', parentId);
      } else {
        query = query.is('parent_folder_id', null);
      }

      const { data, error } = await query.order('title');

      if (error) throw error;

      return (data || []).map((item): FolderStructure => ({
        id: safeStringCast(item.id),
        name: safeStringCast(item.title),
        type: (item.folder_type as 'form' | 'document' | 'client' | 'folder' | 'estate') || 'folder',
        parentId: item.parent_folder_id ? safeStringCast(item.parent_folder_id) : undefined,
        children: [],
        metadata: item.metadata || {}
      }));
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw error;
    }
  },

  async moveFolderOrDocument(itemId: string, newParentId: string | null): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ parent_folder_id: newParentId })
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error moving item:', error);
      throw error;
    }
  }
};

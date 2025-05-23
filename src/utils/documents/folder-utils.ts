
import { supabase } from '@/lib/supabase';
import { FolderOperationResult } from '@/types/folders';
import { safeStringCast, safeObjectCast } from '@/utils/typeGuards';

export const createDocumentFolder = async (
  folderName: string,
  parentId?: string,
  folderType: string = 'folder'
): Promise<FolderOperationResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const folderData = {
      title: safeStringCast(folderName),
      is_folder: true,
      folder_type: folderType,
      parent_folder_id: parentId || null,
      user_id: user.id,
      metadata: {}
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(folderData)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Folder created successfully',
      folderId: safeStringCast(data?.id)
    };
  } catch (error) {
    console.error('Error creating folder:', error);
    return {
      success: false,
      message: 'Failed to create folder'
    };
  }
};

export const getFolderStructure = async (parentId?: string): Promise<any[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

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

    if (error) {
      console.error('Error fetching folder structure:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFolderStructure:', error);
    return [];
  }
};

export const deleteFolder = async (folderId: string): Promise<FolderOperationResult> => {
  try {
    // Check if folder has children
    const { data: children, error: childrenError } = await supabase
      .from('documents')
      .select('id')
      .eq('parent_folder_id', folderId);

    if (childrenError) {
      return {
        success: false,
        message: childrenError.message
      };
    }

    if (children && children.length > 0) {
      return {
        success: false,
        message: 'Cannot delete folder that contains documents or subfolders'
      };
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', folderId);

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Folder deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting folder:', error);
    return {
      success: false,
      message: 'Failed to delete folder'
    };
  }
};

export const moveDocument = async (
  documentId: string,
  newParentId: string | null
): Promise<FolderOperationResult> => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ parent_folder_id: newParentId })
      .eq('id', documentId);

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Document moved successfully'
    };
  } catch (error) {
    console.error('Error moving document:', error);
    return {
      success: false,
      message: 'Failed to move document'
    };
  }
};

export const renameFolder = async (
  folderId: string,
  newName: string
): Promise<FolderOperationResult> => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ title: safeStringCast(newName) })
      .eq('id', folderId);

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Folder renamed successfully'
    };
  } catch (error) {
    console.error('Error renaming folder:', error);
    return {
      success: false,
      message: 'Failed to rename folder'
    };
  }
};

export const getFolderDocuments = async (folderId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('parent_folder_id', folderId)
      .eq('is_folder', false)
      .order('title');

    if (error) {
      console.error('Error fetching folder documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFolderDocuments:', error);
    return [];
  }
};

export const updateFolderMetadata = async (
  folderId: string,
  metadata: Record<string, any>
): Promise<FolderOperationResult> => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ metadata: safeObjectCast(metadata) })
      .eq('id', folderId);

    if (error) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: true,
      message: 'Folder metadata updated successfully'
    };
  } catch (error) {
    console.error('Error updating folder metadata:', error);
    return {
      success: false,
      message: 'Failed to update folder metadata'
    };
  }
};

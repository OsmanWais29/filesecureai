
import { supabase } from "@/lib/supabase";
import { FolderStructure, FolderPermissions } from "@/types/folders";
import { Document } from "@/types/client";
import { safeStringCast, convertDocumentArray, convertToClientDocument } from "@/utils/typeGuards";

export const folderService = {
  async createFolder(name: string, parentId?: string, type: 'client' | 'estate' | 'form' | 'document' | 'folder' = 'folder'): Promise<FolderStructure> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const folderData = {
      title: name,
      is_folder: true,
      folder_type: type,
      parent_folder_id: parentId || null,
      user_id: user.id,
      type: 'folder',
      metadata: { 
        created_by: user.id,
        folder_type: type
      }
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
      type,
      level: 0,
      children: [],
      metadata: data.metadata,
      parent_id: data.parent_folder_id,
      is_folder: true,
      folder_type: type
    };
  },

  async getFolderStructure(): Promise<FolderStructure[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_folder', true)
      .order('title');

    if (error) throw error;

    const folders = data?.map(item => ({
      id: safeStringCast(item.id),
      name: safeStringCast(item.title),
      type: (item.folder_type as FolderStructure['type']) || 'folder',
      level: 0,
      children: [],
      metadata: item.metadata,
      parent_id: item.parent_folder_id,
      is_folder: true,
      folder_type: item.folder_type
    })) || [];

    return this.buildHierarchy(folders);
  },

  buildHierarchy(folders: FolderStructure[]): FolderStructure[] {
    const folderMap = new Map<string, FolderStructure>();
    const rootFolders: FolderStructure[] = [];

    // Create folder map
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Build hierarchy
    folders.forEach(folder => {
      const currentFolder = folderMap.get(folder.id);
      if (!currentFolder) return;

      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(currentFolder);
          currentFolder.level = parent.level + 1;
        } else {
          rootFolders.push(currentFolder);
        }
      } else {
        rootFolders.push(currentFolder);
      }
    });

    return rootFolders;
  },

  async moveDocument(documentId: string, targetFolderId: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .update({ parent_folder_id: targetFolderId })
      .eq('id', documentId);

    if (error) throw error;
  },

  async getFolderDocuments(folderId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('parent_folder_id', folderId)
      .eq('is_folder', false);

    if (error) throw error;

    return convertDocumentArray(data || []);
  },

  async searchDocuments(query: string, folderId?: string): Promise<Document[]> {
    let queryBuilder = supabase
      .from('documents')
      .select('*')
      .eq('is_folder', false)
      .ilike('title', `%${query}%`);

    if (folderId) {
      queryBuilder = queryBuilder.eq('parent_folder_id', folderId);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;

    return convertDocumentArray(data || []);
  },

  async getClientFolders(): Promise<FolderStructure[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_folder', true)
      .eq('folder_type', 'client')
      .order('title');

    if (error) throw error;

    return data?.map(item => ({
      id: safeStringCast(item.id),
      name: safeStringCast(item.title),
      type: 'client' as const,
      level: 0,
      children: [],
      metadata: item.metadata,
      parent_id: item.parent_folder_id,
      is_folder: true,
      folder_type: 'client'
    })) || [];
  },

  async findSimilarClientFolders(clientName: string): Promise<{ folders: FolderStructure[]; suggestions: string[] }> {
    const cleanName = safeStringCast(clientName).toLowerCase();
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_folder', true)
      .eq('folder_type', 'client');

    if (error) throw error;

    const allFolders = data?.map(item => ({
      id: safeStringCast(item.id),
      name: safeStringCast(item.title),
      type: 'client' as const,
      level: 0,
      children: [],
      metadata: item.metadata,
      parent_id: item.parent_folder_id,
      is_folder: true,
      folder_type: 'client'
    })) || [];

    const similarFolders = allFolders.filter(folder => {
      const folderName = folder.name.toLowerCase();
      return folderName.includes(cleanName) || cleanName.includes(folderName);
    });

    const suggestions = similarFolders.map(f => f.name);

    return { folders: similarFolders, suggestions };
  }
};

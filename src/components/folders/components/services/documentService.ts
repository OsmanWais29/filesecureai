
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { mergeClientFolders } from "@/utils/documents/mergeClientFolders";

export const documentService = {
  async renameItem(itemId: string, newName: string) {
    const { error } = await supabase
      .from('documents')
      .update({ title: newName.trim() })
      .eq('id', itemId);

    if (error) throw error;
  },

  async getItemName(itemId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('title')
      .eq('id', itemId)
      .single();

    if (error) {
      console.error('Error fetching item name:', error);
      return null;
    }

    return data?.title ? String(data.title) : null;
  },

  async deleteItem(itemId: string, itemType: "folder" | "file") {
    // Check if folder is empty
    if (itemType === 'folder') {
      const { data: containedItems } = await supabase
        .from('documents')
        .select('id')
        .eq('parent_folder_id', itemId);

      if (containedItems && containedItems.length > 0) {
        throw new Error("Cannot delete non-empty folder");
      }
    }

    // Handle file storage deletion
    if (itemType === 'file') {
      const { data: document } = await supabase
        .from('documents')
        .select('storage_path')
        .eq('id', itemId)
        .single();

      if (document?.storage_path) {
        await supabase.storage
          .from('documents')
          .remove([String(document.storage_path)]);
      }
    }

    // Delete from documents table
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },

  async mergeClientFolders(clientName: string) {
    try {
      const user = await supabase.auth.getUser();
      if (user.error) throw user.error;
      
      return await mergeClientFolders(clientName, user.data.user?.id || '');
    } catch (error) {
      console.error('Error in mergeClientFolders service:', error);
      throw error;
    }
  },

  async findMergeableFolders(clientName: string) {
    try {
      // Get all folder documents that match the client name pattern
      const { data: folders, error } = await supabase
        .from('documents')
        .select('id, title, folder_type, parent_folder_id')
        .eq('is_folder', true)
        .ilike('title', `%${clientName}%`);
      
      if (error) throw error;
      
      if (!folders || folders.length <= 1) {
        return { mergeableClientFolders: {}, folderNames: {} };
      }
      
      // Group similar folders
      const clientFolderGroups: Record<string, string[]> = {};
      const folderNames: Record<string, string> = {};
      
      // First, create a map of folder names for easy lookup
      folders.forEach(folder => {
        folderNames[String(folder.id)] = String(folder.title);
      });
      
      // Then, organize folders into mergeable groups
      folders.forEach(mainFolder => {
        const mainFolderId = String(mainFolder.id);
        if (!clientFolderGroups[mainFolderId]) {
          const similarFolders = folders.filter(otherFolder => 
            String(otherFolder.id) !== mainFolderId && 
            this.areSimilarClientFolders(String(mainFolder.title), String(otherFolder.title))
          ).map(folder => String(folder.id));
          
          if (similarFolders.length > 0) {
            clientFolderGroups[mainFolderId] = similarFolders;
          }
        }
      });
      
      return { 
        mergeableClientFolders: clientFolderGroups,
        folderNames
      };
    } catch (error) {
      console.error('Error finding mergeable folders:', error);
      throw error;
    }
  },
  
  // Helper function to determine if two folder names are for the same client
  areSimilarClientFolders(name1: string, name2: string) {
    const simplifiedName1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const simplifiedName2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check if the names are similar (this can be improved with more sophisticated algorithms)
    // For now, we check if they share a common substring of at least 5 characters
    return (
      simplifiedName1.includes(simplifiedName2.substring(0, 5)) || 
      simplifiedName2.includes(simplifiedName1.substring(0, 5))
    );
  }
};

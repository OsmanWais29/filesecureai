
import { supabase } from '@/lib/supabase';

export const createClientFolder = async (documentId: string, document: any) => {
  if (!documentId || !document) {
    console.log('Missing document ID or document data for folder creation');
    return;
  }

  try {
    const clientName = getClientName(document);
    if (!clientName) {
      console.log('No client name available for folder creation');
      return;
    }

    // Check if client folder already exists
    const { data: existingFolders, error: folderError } = await supabase
      .from('documents')
      .select('id')
      .eq('title', clientName)
      .eq('is_folder', true)
      .limit(1);

    if (folderError) {
      console.error('Error checking for existing client folder:', folderError);
      return;
    }

    let clientFolderId;

    if (!existingFolders || existingFolders.length === 0) {
      // Create new client folder
      const { data: newFolder, error: createError } = await supabase
        .from('documents')
        .insert([
          {
            title: clientName,
            is_folder: true,
            folder_type: 'client'
          }
        ])
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating client folder:', createError);
        return;
      }

      clientFolderId = newFolder.id;
    } else {
      clientFolderId = existingFolders[0].id;
    }

    // Update document to be under client folder
    await supabase
      .from('documents')
      .update({
        parent_folder_id: clientFolderId
      })
      .eq('id', documentId);

    return clientFolderId;
  } catch (error) {
    console.error('Error organizing folder:', error);
  }
};

const getClientName = (document: any): string | null => {
  if (!document) return null;
  
  try {
    // Try to extract client name from metadata or document title
    if (document.metadata?.client_name) {
      return document.metadata.client_name;
    }
    
    if (document.title) {
      const titleParts = document.title.split('-');
      if (titleParts.length > 1) {
        return titleParts[0].trim();
      }
      
      // If client name can't be determined, use "Uncategorized"
      return 'Uncategorized';
    }
    
    return 'Uncategorized';
  } catch (error) {
    console.error('Error extracting client name:', error);
    return 'Uncategorized';
  }
};

// Export the functions to use them in other files
export { getClientName };

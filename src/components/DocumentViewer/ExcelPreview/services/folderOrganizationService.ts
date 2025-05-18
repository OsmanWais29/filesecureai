import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';

export const createClientFolder = async (documentId: string, document: any): Promise<string | null> => {
  try {
    if (!document || !document.metadata || typeof document.metadata !== 'object') {
      console.warn('Document or document metadata is missing.');
      return null;
    }

    // Safe access with type checking
    const isProcessingComplete = document.metadata && 
      typeof document.metadata === 'object' && 
      'processing_complete' in document.metadata && 
      document.metadata.processing_complete === true;
    
    if (!isProcessingComplete) {
      console.log('Document processing is not complete, skipping folder creation.');
      return null;
    }

    const clientName = document.metadata.client_name as string;
    if (!clientName) {
      console.warn('Client name is missing from document metadata.');
      return null;
    }

    // Check if a folder with the client name already exists
    const { data: existingFolders, error: folderError } = await supabase
      .from('documents')
      .select('id')
      .eq('title', clientName)
      .eq('is_folder', true)
      .eq('folder_type', 'client');

    if (folderError) {
      console.error('Error checking for existing client folder:', folderError);
      return null;
    }

    let folderId: string;
    if (existingFolders && existingFolders.length > 0) {
      // Use the existing folder's ID
      folderId = existingFolders[0].id;
      console.log(`Client folder "${clientName}" already exists with ID: ${folderId}`);
    } else {
      // Create a new folder for the client
      const newFolderId = uuidv4();
      const { error: insertError } = await supabase
        .from('documents')
        .insert([
          {
            id: newFolderId,
            title: clientName,
            is_folder: true,
            folder_type: 'client',
            storage_path: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            size: 0,
            metadata: { client_name: clientName }
          }
        ]);

      if (insertError) {
        console.error('Error creating client folder:', insertError);
        return null;
      }

      folderId = newFolderId;
      console.log(`Client folder "${clientName}" created with ID: ${folderId}`);
    }

    // Update the document to reference the client folder
    const { error: updateError } = await supabase
      .from('documents')
      .update({ parent_folder_id: folderId })
      .eq('id', documentId);

    if (updateError) {
      console.error('Error updating document with folder ID:', updateError);
      return null;
    }

    console.log(`Document "${documentId}" updated to reference folder "${clientName}" (${folderId})`);
    return folderId;

  } catch (error) {
    console.error('Error creating client folder:', error);
    return null;
  }
};

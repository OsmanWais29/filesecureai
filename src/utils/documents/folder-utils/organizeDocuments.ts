
import { supabase } from '@/lib/supabase';
import { safeStringCast } from '@/utils/typeGuards';

export const organizeDocumentsByClient = async (documents: any[]) => {
  try {
    const organized = new Map<string, any[]>();

    for (const doc of documents) {
      const docId = safeStringCast(doc.id);
      const docTitle = safeStringCast(doc.title);
      const docType = safeStringCast(doc.type || 'document');
      const folderType = safeStringCast(doc.folder_type || '');

      // Skip if essential data is missing
      if (!docId || !docTitle) {
        continue;
      }

      const clientName = safeStringCast(doc.client_name || 'Uncategorized');
      const estateNumber = safeStringCast(doc.estate_number || '');

      if (!organized.has(clientName)) {
        organized.set(clientName, []);
      }

      organized.get(clientName)?.push({
        id: docId,
        title: docTitle,
        type: docType,
        folder_type: folderType,
        estate_number: estateNumber
      });
    }

    return {
      success: true,
      organized: Object.fromEntries(organized)
    };

  } catch (error) {
    console.error('Error organizing documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const organizeDocumentIntoFolders = async (
  documentId: string,
  clientName: string,
  formType?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Find or create client folder
    let clientFolderId = null;
    
    const { data: clientFolder } = await supabase
      .from('documents')
      .select('id')
      .eq('title', clientName)
      .eq('is_folder', true)
      .eq('folder_type', 'client')
      .eq('user_id', user.id)
      .single();

    if (clientFolder) {
      clientFolderId = safeStringCast(clientFolder.id);
    } else {
      // Create client folder
      const { data: newFolder, error: folderError } = await supabase
        .from('documents')
        .insert({
          title: clientName,
          is_folder: true,
          folder_type: 'client',
          user_id: user.id,
          metadata: {
            client_name: clientName,
            created_by: 'system'
          }
        })
        .select('id')
        .single();

      if (folderError) throw folderError;
      clientFolderId = safeStringCast(newFolder?.id);
    }

    // Move document to client folder
    const { error: moveError } = await supabase
      .from('documents')
      .update({
        parent_folder_id: clientFolderId,
        metadata: {
          client_name: clientName,
          form_type: formType || 'unknown',
          organized_at: new Date().toISOString()
        }
      })
      .eq('id', documentId);

    if (moveError) throw moveError;

    return {
      success: true,
      clientFolderId,
      message: 'Document organized successfully'
    };

  } catch (error) {
    console.error('Error organizing document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

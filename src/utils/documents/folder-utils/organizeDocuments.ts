
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

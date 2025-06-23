
import { supabase } from '@/lib/supabase';

export class DuplicatePreventionService {
  static async checkForDuplicates(file: File, userId: string) {
    try {
      // Check for files with same name and size
      const { data: existingDocuments, error } = await supabase
        .from('documents')
        .select('id, title, size, created_at')
        .eq('user_id', userId)
        .eq('title', file.name)
        .eq('size', file.size);

      if (error) {
        console.error('Duplicate check failed:', error);
        return { isDuplicate: false, existingDocuments: [] };
      }

      return {
        isDuplicate: existingDocuments && existingDocuments.length > 0,
        existingDocuments: existingDocuments || []
      };
    } catch (error) {
      console.error('Duplicate prevention service failed:', error);
      return { isDuplicate: false, existingDocuments: [] };
    }
  }

  static async handleDuplicateResolution(
    action: 'replace' | 'version' | 'rename' | 'cancel',
    file: File,
    existingDocumentId?: string,
    newName?: string
  ) {
    try {
      switch (action) {
        case 'replace':
          return { proceed: true, action: 'replace', documentId: existingDocumentId };
        case 'version':
          return { proceed: true, action: 'version', documentId: existingDocumentId };
        case 'rename':
          return { proceed: true, action: 'rename', newName };
        case 'cancel':
          return { proceed: false };
        default:
          return { proceed: false };
      }
    } catch (error) {
      console.error('Duplicate resolution failed:', error);
      return { proceed: false };
    }
  }
}

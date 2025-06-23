
import { supabase } from '@/lib/supabase';

export class FileVersioningService {
  static async createVersion(documentId: string, file: File, description: string) {
    try {
      // Get current version number
      const { data: versions } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);

      const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

      // Create new version record
      const { data: version, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: nextVersion,
          description,
          is_current: true,
          metadata: {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create version:', error);
        return null;
      }

      return version;
    } catch (error) {
      console.error('Version creation failed:', error);
      return null;
    }
  }
}

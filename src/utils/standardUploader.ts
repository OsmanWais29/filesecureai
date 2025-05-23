
import { supabase } from '@/lib/supabase';
import { FileUploadResult } from './jwtDiagnosticsTypes';

export const standardUploader = async (
  file: File,
  storagePath: string
): Promise<FileUploadResult> => {
  try {
    console.log('Using standard uploader for:', storagePath);
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Standard upload error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: urlData.publicUrl,
      details: data
    };
  } catch (error) {
    console.error('Standard uploader exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
};

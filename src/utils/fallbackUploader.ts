
import { supabase } from '@/lib/supabase';
import { FileUploadResult } from './jwtDiagnosticsTypes';

export const fallbackUploader = async (
  file: File,
  storagePath: string
): Promise<FileUploadResult> => {
  try {
    console.log('Using fallback uploader for:', storagePath);
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Fallback upload error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    return {
      success: true,
      details: data
    };
  } catch (error) {
    console.error('Fallback uploader exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
};

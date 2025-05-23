
import { supabase } from '@/lib/supabase';
import { FileUploadResult } from './jwtDiagnosticsTypes';

export const signedUrlUploader = async (
  file: File,
  storagePath: string
): Promise<FileUploadResult> => {
  try {
    console.log('Using signed URL uploader for:', storagePath);
    
    // Create a signed upload URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('documents')
      .createSignedUploadUrl(storagePath);

    if (urlError) {
      console.error('Signed URL creation error:', urlError);
      return {
        success: false,
        error: urlError.message,
        details: urlError
      };
    }

    // Upload using the signed URL
    const response = await fetch(signedUrlData.signedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Upload failed: ${response.status} ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText, errorText }
      };
    }

    return {
      success: true,
      url: signedUrlData.signedUrl,
      details: { path: signedUrlData.path }
    };
  } catch (error) {
    console.error('Signed URL uploader exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
};

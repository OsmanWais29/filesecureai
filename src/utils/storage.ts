
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ensureValidToken } from '@/utils/jwt/tokenManager';

interface UploadOptions {
  diagnostics?: boolean;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  data?: { path: string; fullPath: string };
  error?: string;
}

export const uploadFile = async (
  file: File,
  bucket: string,
  path: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    // Ensure we have a valid token before attempting upload
    const tokenValid = await ensureValidToken();
    if (!tokenValid) {
      throw new Error('Authentication token is invalid or expired');
    }

    if (options.diagnostics) {
      console.log(`Starting upload: ${file.name} to ${bucket}/${path}`);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    if (options.diagnostics) {
      console.log('Upload successful:', data);
    }

    return {
      data: {
        path: data.path,
        fullPath: data.fullPath
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
    console.error('Upload failed:', errorMessage);
    
    if (options.diagnostics) {
      toast.error(`Upload failed: ${errorMessage}`);
    }
    
    return { error: errorMessage };
  }
};

export const downloadFile = async (bucket: string, path: string): Promise<Blob | null> => {
  try {
    const tokenValid = await ensureValidToken();
    if (!tokenValid) {
      throw new Error('Authentication token is invalid or expired');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Download failed:', error);
    return null;
  }
};

export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const tokenValid = await ensureValidToken();
    if (!tokenValid) {
      throw new Error('Authentication token is invalid or expired');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
};

export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

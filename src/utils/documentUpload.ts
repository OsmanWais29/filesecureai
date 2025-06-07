
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UploadDocumentOptions {
  onProgress?: (progress: number) => void;
  clientName?: string;
}

export const uploadDocumentToStorage = async (
  file: File,
  options: UploadDocumentOptions = {}
): Promise<{ success: boolean; documentId?: string; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    options.onProgress?.(10);

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    options.onProgress?.(50);

    // Create document record in database
    const { data: documentData, error: docError } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        storage_path: filePath,
        type: file.type,
        size: file.size,
        user_id: user.id,
        ai_processing_status: 'pending',
        metadata: {
          originalName: file.name,
          clientName: options.clientName,
          uploadedAt: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (docError) {
      console.error('Document record error:', docError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([filePath]);
      throw docError;
    }

    if (!documentData?.id) {
      throw new Error('Failed to create document record');
    }

    options.onProgress?.(100);

    return {
      success: true,
      documentId: String(documentData.id)
    };

  } catch (error) {
    console.error('Document upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const getDocumentUrl = (storagePath: string): string => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(storagePath);
    
  return data.publicUrl;
};

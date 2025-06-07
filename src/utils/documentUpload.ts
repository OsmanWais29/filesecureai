
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
        is_folder: false, // Ensure this is set for proper filtering
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

    // Create notification for successful upload
    try {
      await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: user.id,
          notification: {
            title: 'Document Uploaded',
            message: `"${file.name}" has been uploaded successfully`,
            type: 'success',
            category: 'file_activity',
            priority: 'normal',
            action_url: `/document/${documentData.id}`,
            metadata: {
              documentId: documentData.id,
              fileName: file.name,
              uploadedAt: new Date().toISOString()
            }
          }
        }
      });
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
      // Don't fail the upload if notification fails
    }

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

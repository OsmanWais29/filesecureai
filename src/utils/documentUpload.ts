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
    // Ensure user is authenticated before starting upload
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError);
      throw new Error('Authentication failed. Please log in and try again.');
    }
    
    if (!user) {
      throw new Error('You must be logged in to upload documents');
    }

    options.onProgress?.(10);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    options.onProgress?.(25);

    // Upload file to documents storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
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
        is_folder: false,
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
      throw new Error(`Database error: ${docError.message}`);
    }

    if (!documentData?.id) {
      throw new Error('Failed to create document record');
    }

    options.onProgress?.(75);

    // Trigger DeepSeek analysis for the document
    try {
      // Verify we still have a valid session before analysis
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await supabase.functions.invoke('deepseek-document-analysis', {
          body: {
            documentId: documentData.id,
            fileName: file.name,
            filePath: filePath,
            extractionMode: 'comprehensive',
            includeRegulatory: true
          }
        });
        console.log('DeepSeek analysis triggered successfully');
      } else {
        console.warn('No valid session for DeepSeek analysis - skipping');
      }
    } catch (analysisError) {
      console.warn('DeepSeek analysis failed to trigger:', analysisError);
      // Don't fail the upload if analysis fails
    }

    options.onProgress?.(90);

    // Create notification for successful upload
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await supabase.functions.invoke('handle-notifications', {
          body: {
            action: 'create',
            userId: user.id,
            notification: {
              title: 'Document Uploaded',
              message: `"${file.name}" has been uploaded and is being analyzed`,
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
      }
    } catch (notificationError) {
      console.warn('Failed to create notification:', notificationError);
      // Don't fail the upload if notification fails
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

export const getSignedDocumentUrl = async (storagePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Failed to create signed URL:', error);
    return null;
  }
};

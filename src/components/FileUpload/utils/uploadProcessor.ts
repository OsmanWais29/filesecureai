
import { supabase } from "@/lib/supabase";
import logger from "@/utils/logger";

export const simulateProcessingStages = async (
  isSpecialForm: boolean,
  isExcel: boolean,
  setProgress: (progress: number) => void,
  setStep: (step: string) => void
): Promise<void> => {
  const stages = [
    { progress: 20, step: "Validating file format...", delay: 500 },
    { progress: 40, step: "Uploading to secure storage...", delay: 800 },
    { progress: 60, step: "Extracting document metadata...", delay: 600 },
    { progress: 80, step: isSpecialForm ? "Running AI analysis..." : "Processing document...", delay: 1000 },
    { progress: 100, step: "Upload complete!", delay: 300 }
  ];

  for (const stage of stages) {
    setProgress(stage.progress);
    setStep(stage.step);
    await new Promise(resolve => setTimeout(resolve, stage.delay));
  }
};

export const createDocumentRecord = async (
  file: File,
  userId: string,
  parentFolderId?: string,
  isSpecialForm?: boolean,
  metadata?: Record<string, any>
) => {
  // Verify user is authenticated before creating record
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user || user.id !== userId) {
    throw new Error('Authentication required to create document record');
  }

  return await supabase
    .from('documents')
    .insert({
      title: file.name,
      type: file.type,
      size: file.size,
      user_id: userId,
      parent_folder_id: parentFolderId,
      is_folder: false,
      ai_processing_status: isSpecialForm ? 'pending' : 'complete',
      metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        ...metadata
      }
    })
    .select()
    .single();
};

export const uploadToStorage = async (
  file: File,
  userId: string,
  filePath: string
) => {
  // Verify user is authenticated before uploading
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user || user.id !== userId) {
    throw new Error('Authentication required to upload to storage');
  }

  return await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });
};

export const triggerDocumentAnalysis = async (
  documentId: string,
  fileName: string,
  isSpecialForm: boolean
) => {
  if (!isSpecialForm) return;
  
  try {
    // Verify user is authenticated before triggering analysis
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.error('Authentication required for document analysis:', authError);
      throw new Error('Authentication required to trigger document analysis');
    }
    
    logger.info(`Triggering DeepSeek analysis for document ${documentId}`);
    
    // Get a fresh session for the edge function call
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No valid session for analysis trigger');
    }
    
    // Call the correct DeepSeek edge function with proper auth context
    const { error } = await supabase.functions.invoke('deepseek-document-analysis', {
      body: {
        documentId,
        fileName,
        extractionMode: 'comprehensive',
        includeRegulatory: true
      }
    });
    
    if (error) {
      logger.error('DeepSeek document analysis failed:', error);
      throw error;
    }
    
    logger.info(`DeepSeek analysis triggered successfully for document ${documentId}`);
  } catch (err) {
    logger.error('Failed to trigger DeepSeek document analysis:', err);
    throw err;
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  documentId: string,
  fileName: string,
  status: string
) => {
  try {
    // Verify user is authenticated before creating notification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user || user.id !== userId) {
      logger.error('Authentication required for notification creation:', authError);
      return; // Don't throw error for notifications, just log and return
    }

    await supabase.functions.invoke('handle-notifications', {
      body: {
        action: 'create',
        userId,
        notification: {
          title,
          message,
          type,
          category: 'file_activity',
          priority: 'normal',
          action_url: `/document/${documentId}`,
          metadata: {
            documentId,
            fileName,
            status,
            timestamp: new Date().toISOString()
          }
        }
      }
    });
  } catch (error) {
    logger.error('Failed to create notification:', error);
    // Don't rethrow for notifications as they're not critical to the upload process
  }
};

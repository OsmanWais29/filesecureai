
import { supabase } from '@/lib/supabase';
import { uploadDocumentToStorage } from '@/utils/documentUpload';

export const simulateProcessingStages = async (
  isSpecialForm: boolean,
  isExcel: boolean,
  setUploadProgress: (progress: number) => void,
  setUploadStep: (step: string) => void
): Promise<void> => {
  const stages = [
    { progress: 20, step: "Uploading file to secure storage..." },
    { progress: 40, step: "Extracting document content..." },
    { progress: 60, step: isSpecialForm ? "Analyzing form structure..." : "Processing document..." },
    { progress: 80, step: isExcel ? "Validating financial data..." : "Completing analysis..." },
    { progress: 100, step: "Upload complete!" }
  ];

  for (const stage of stages) {
    setUploadProgress(stage.progress);
    setUploadStep(stage.step);
    await new Promise(resolve => setTimeout(resolve, 800));
  }
};

export const createDocumentRecord = async (
  file: File,
  userId: string,
  clientName?: string,
  isSpecialForm: boolean = false,
  additionalMetadata: Record<string, any> = {}
) => {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: file.name,
      type: file.type,
      size: file.size,
      user_id: userId,
      ai_processing_status: isSpecialForm ? 'pending' : 'complete',
      metadata: {
        originalName: file.name,
        clientName,
        uploadedAt: new Date().toISOString(),
        ...additionalMetadata
      }
    })
    .select()
    .single();

  return { data, error };
};

export const uploadToStorage = async (file: File, userId: string, filePath: string) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  return { data, error };
};

export const triggerDocumentAnalysis = async (
  documentId: string,
  fileName: string,
  isSpecialForm: boolean
) => {
  if (!isSpecialForm) return;

  try {
    await supabase.functions.invoke('analyze-document', {
      body: {
        documentId,
        fileName,
        analysisType: 'comprehensive'
      }
    });
  } catch (error) {
    console.error('Analysis trigger failed:', error);
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  documentId?: string,
  fileName?: string,
  status?: string
) => {
  try {
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
          action_url: documentId ? `/document/${documentId}` : undefined,
          metadata: {
            documentId,
            fileName,
            status,
            createdAt: new Date().toISOString()
          }
        }
      }
    });
  } catch (error) {
    console.error('Notification creation failed:', error);
  }
};

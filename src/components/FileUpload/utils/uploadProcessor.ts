
import { simulateUploadProgress } from "./progressSimulator";
import logger from "@/utils/logger";
import { supabase } from "@/lib/supabase";

/**
 * Simulates the processing stages of a document upload
 * @param isSpecialForm Whether the document is a special form that requires analysis
 * @param isExcel Whether the document is an Excel file
 * @param setUploadProgress Function to set the upload progress
 * @param setUploadStep Function to set the upload step message
 * @returns A promise that resolves when the simulation is complete
 */
export const simulateProcessingStages = (
  isSpecialForm: boolean,
  isExcel: boolean,
  setUploadProgress: (progress: number) => void,
  setUploadStep: (step: string) => void
): Promise<void> => {
  const stages = [
    { 
      text: "Uploading document...", 
      duration: 1500,
      startProgress: 5,
      endProgress: 40 
    },
    { 
      text: "Processing document...", 
      duration: 800,
      startProgress: 40,
      endProgress: 60
    },
    {
      text: isSpecialForm ? "Running compliance checks..." : "Preparing document preview...",
      duration: isSpecialForm ? 1800 : 800,
      startProgress: 60,
      endProgress: 85
    },
    {
      text: isExcel ? "Extracting data from spreadsheet..." : "Finalizing document...",
      duration: isExcel ? 1500 : 700,
      startProgress: 85,
      endProgress: 100
    }
  ];

  return simulateUploadProgress(stages, setUploadProgress, setUploadStep);
};

/**
 * Creates a document record in the database
 * @param file The file to create a record for
 * @param userId The user ID
 * @param parentFolderId Optional parent folder ID
 * @param isSpecialForm Whether the document is a special form
 * @returns The created document record
 */
export const createDocumentRecord = async (
  file: File, 
  userId: string,
  parentFolderId?: string,
  isSpecialForm?: boolean,
  additionalMetadata?: any
) => {
  try {
    logger.info(`Creating document record for ${file.name}`);
    
    const documentMetadata = {
      originalFileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      analyzed: isSpecialForm ? false : undefined,
      requiresAnalysis: isSpecialForm,
      ...additionalMetadata
    };

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: file.name,
        type: file.type.split('/')[1] || 'document',
        size: file.size,
        metadata: documentMetadata,
        user_id: userId,
        parent_folder_id: parentFolderId,
        ai_processing_status: isSpecialForm ? 'pending' : 'not_applicable'
      })
      .select()
      .single();

    if (error) {
      logger.error(`Error creating document record: ${error.message}`);
      throw error;
    }

    return { data, error: null };
  } catch (err) {
    logger.error(`Failed to create document record: ${err}`);
    return { data: null, error: err };
  }
};

/**
 * Uploads a file to storage
 * @param file The file to upload
 * @param userId The user ID
 * @param filePath The path to store the file at
 * @returns The result of the upload operation
 */
export const uploadToStorage = async (file: File, userId: string, filePath: string) => {
  try {
    logger.info(`Uploading ${file.name} to ${filePath}`);
    
    const { error } = await supabase
      .storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      logger.error(`Storage upload error: ${error.message}`);
      throw error;
    }

    logger.info(`Upload successful: ${filePath}`);
    return { error: null };
  } catch (err) {
    logger.error(`Failed to upload to storage: ${err}`);
    return { error: err };
  }
};

/**
 * Triggers document analysis through the edge function
 * @param documentId The document ID to analyze
 * @param fileName The file name (for type detection)
 * @param shouldAnalyze Whether the document should be analyzed
 */
export const triggerDocumentAnalysis = async (documentId: string, fileName: string, shouldAnalyze: boolean = false): Promise<void> => {
  try {
    if (!shouldAnalyze && !requiresAnalysis(fileName)) {
      logger.info(`Skipping analysis for ${fileName} (not required)`);
      return;
    }
    
    logger.info(`Triggering analysis for document ${documentId}`);
    
    // Update document status to processing
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        ai_processing_status: 'processing'
      })
      .eq('id', documentId);
      
    if (updateError) {
      logger.error(`Error updating document status: ${updateError.message}`);
      throw updateError;
    }
    
    // Get document storage path
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('storage_path, title')
      .eq('id', documentId)
      .single();
      
    if (docError || !docData?.storage_path) {
      logger.error(`Error getting document path: ${docError?.message || 'No storage path'}`);
      throw docError || new Error('No storage path found');
    }

    logger.info(`Invoking process-ai-request function for ${documentId}`);
    
    // Call the edge function to analyze the document
    const { data, error } = await supabase.functions.invoke('process-ai-request', {
      body: { 
        documentId,
        storagePath: docData.storage_path,
        title: docData.title || fileName
      }
    });
    
    if (error) {
      logger.error(`Analysis function error: ${error.message}`);
      
      // Update document status to error
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'error',
          metadata: {
            ...docData,
            analysisError: error.message
          }
        })
        .eq('id', documentId);
        
      throw error;
    }
    
    logger.info(`Analysis complete for ${documentId}`);
    
  } catch (error) {
    logger.error(`Document analysis error: ${error}`);
    
    // Update document status to error
    await supabase
      .from('documents')
      .update({
        ai_processing_status: 'error'
      })
      .eq('id', documentId);
  }
};

/**
 * Creates a notification
 * @param userId The user ID
 * @param title The notification title
 * @param message The notification message
 * @param type The notification type
 * @param documentId Optional document ID
 * @param fileName Optional file name
 * @param category Optional notification category
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error',
  documentId?: string,
  fileName?: string,
  category?: string
): Promise<void> => {
  try {
    logger.info(`Creating notification: ${title}`);
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        priority: type === 'error' ? 'high' : 'normal',
        action_url: documentId ? `/documents/${documentId}` : undefined,
        metadata: {
          documentId,
          fileName,
          category
        }
      });
      
    if (error) {
      logger.error(`Error creating notification: ${error.message}`);
    }
  } catch (error) {
    logger.error(`Failed to create notification: ${error}`);
  }
};

/**
 * Determines if a document requires analysis based on its file name
 * @param fileName The file name to check
 * @returns Whether the document requires analysis
 */
const requiresAnalysis = (fileName: string): boolean => {
  const lowerFileName = fileName.toLowerCase();
  
  return lowerFileName.includes('form 31') || 
         lowerFileName.includes('form31') || 
         lowerFileName.includes('proof of claim') || 
         lowerFileName.includes('form 47') || 
         lowerFileName.includes('form47') || 
         lowerFileName.includes('consumer proposal') || 
         lowerFileName.includes('form 76') || 
         lowerFileName.includes('form76') || 
         lowerFileName.includes('statement of affairs');
};

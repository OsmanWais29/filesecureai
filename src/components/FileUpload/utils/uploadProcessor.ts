import { simulateUploadProgress } from "./progressSimulator";
import logger from "@/utils/logger";
import { supabase } from "@/lib/supabase";
import { logAIRequest } from "@/utils/aiRequestMonitor";
import { FileInfo } from '@/types/client';
import { ensureSpreadableObject } from '@/utils/typeGuards';
import { toast } from 'sonner';

// Type guard for ensuring object is spreadable
const ensureSpreadableObject = (obj: unknown): Record<string, any> => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return obj as Record<string, any>;
  }
  return {};
};

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
        ai_processing_status: 'processing',
        metadata: {
          analysis_initiated: true,
          analysis_initiated_at: new Date().toISOString(),
          analysis_status: 'processing',
          processing_monitor: 'v2',  // Mark that we're using the enhanced processing monitor
          attempts: 1
        }
      })
      .eq('id', documentId);
      
    if (updateError) {
      logger.error(`Error updating document status: ${updateError.message}`);
      throw updateError;
    }
    
    // Get document storage path
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('storage_path, title, metadata')
      .eq('id', documentId)
      .single();
      
    if (docError || !docData?.storage_path) {
      logger.error(`Error getting document path: ${docError?.message || 'No storage path'}`);
      throw docError || new Error('No storage path found');
    }

    logger.info(`Invoking process-ai-request function for ${documentId}`);
    
    // Log the AI request
    await logAIRequest({
      documentId,
      requestType: 'document_analysis',
      status: 'initiated',
      details: {
        fileName,
        storagePath: docData.storage_path,
        processingVersion: 'v2'
      }
    });
    
    // Ensure we have a fresh session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      logger.error('Session error for API request:', sessionError);
      throw new Error('Authentication required for API request');
    }
    
    // Call the edge function to analyze the document
    const { data, error } = await supabase.functions.invoke('process-ai-request', {
      body: { 
        documentId,
        storagePath: docData.storage_path,
        title: docData.title || fileName,
        includeRegulatory: true,
        includeClientExtraction: true,
        debug: true
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
            analysis_status: 'error',
            analysis_error: error.message,
            analysis_error_at: new Date().toISOString()
          }
        })
        .eq('id', documentId);
        
      // Log the failed request
      await logAIRequest({
        documentId,
        requestType: 'document_analysis',
        status: 'failed',
        details: {
          error: error.message
        }
      });
        
      throw error;
    }
    
    logger.info(`Analysis complete for ${documentId}`);
    
    // Log the completed request
    await logAIRequest({
      documentId,
      requestType: 'document_analysis',
      status: 'completed',
      details: {
        success: true,
        hasResults: !!data
      }
    });
    
    // Update document with completed status
    await supabase
      .from('documents')
      .update({
        ai_processing_status: 'complete',
        metadata: {
          ...(docData.metadata || {}),
          analysis_completed_at: new Date().toISOString(),
          analysis_status: 'complete',
          has_analysis: true
        }
      })
      .eq('id', documentId);
    
  } catch (error: any) {
    logger.error(`Document analysis error: ${error}`);
    
    // Update document status to error
    await supabase
      .from('documents')
      .update({
        ai_processing_status: 'error',
        metadata: {
          analysis_status: 'error',
          analysis_error: error.message,
          analysis_error_at: new Date().toISOString()
        }
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
  
  // Add other forms that require special analysis
  return lowerFileName.includes('form 31') || 
         lowerFileName.includes('form31') || 
         lowerFileName.includes('proof of claim') || 
         lowerFileName.includes('form 47') || 
         lowerFileName.includes('form47') || 
         lowerFileName.includes('consumer proposal') || 
         lowerFileName.includes('form 76') || 
         lowerFileName.includes('form76') || 
         lowerFileName.includes('statement of affairs') ||
         lowerFileName.includes('form 65') ||
         lowerFileName.includes('form65') ||
         lowerFileName.includes('form 72') ||
         lowerFileName.includes('form72') ||
         // Add more common forms
         lowerFileName.includes('form 21') ||
         lowerFileName.includes('form21') ||
         lowerFileName.includes('notice of bankruptcy') ||
         lowerFileName.includes('form 33') ||
         lowerFileName.includes('form33') ||
         lowerFileName.includes('form 40') ||
         lowerFileName.includes('form40') ||
         lowerFileName.includes('notice of intention') ||
         lowerFileName.includes('bankruptcy') ||
         lowerFileName.includes('insolvency');
};

/**
 * Processes uploaded files
 * @param files The files to process
 * @param parentFolderId Optional parent folder ID
 * @returns An object containing success status and uploaded files
 */
export const processUploadedFiles = async (
  files: FileInfo[],
  parentFolderId?: string
): Promise<{ success: boolean; uploadedFiles: FileInfo[] }> => {
  try {
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        try {
          // Upload file to storage
          const { data: storageData, error: storageError } = await supabase.storage
            .from('documents')
            .upload(`${Date.now()}_${file.name}`, file.file);

          if (storageError) throw storageError;

          // Create document record - ensure we have a proper object to spread
          const safeFileData = ensureSpreadableObject(file);
          const documentData = {
            title: file.name,
            type: file.file.type,
            storage_path: storageData.path,
            parent_folder_id: parentFolderId,
            size: file.file.size,
            metadata: {
              original_name: file.name,
              upload_timestamp: new Date().toISOString(),
              ...safeFileData
            }
          };

          const { data: docData, error: docError } = await supabase
            .from('documents')
            .insert(documentData)
            .select()
            .single();

          if (docError) throw docError;

          return {
            ...file,
            documentId: String(docData.id),
            status: 'completed' as const
          };
        } catch (error) {
          console.error('Error processing file:', error);
          return {
            ...file,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Upload failed'
          };
        }
      })
    );

    const successfulUploads = uploadResults.filter(file => file.status === 'completed');
    const failedUploads = uploadResults.filter(file => file.status === 'error');

    if (failedUploads.length > 0) {
      toast.error(`${failedUploads.length} files failed to upload`);
    }

    if (successfulUploads.length > 0) {
      toast.success(`${successfulUploads.length} files uploaded successfully`);
    }

    return {
      success: failedUploads.length === 0,
      uploadedFiles: uploadResults
    };
  } catch (error) {
    console.error('Error in processUploadedFiles:', error);
    toast.error('Failed to process uploaded files');
    return {
      success: false,
      uploadedFiles: []
    };
  }
};

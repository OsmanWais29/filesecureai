
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useFileValidator } from '../components/FileValidator';
import logger from "@/utils/logger";
import { 
  simulateProcessingStages, 
  createDocumentRecord, 
  uploadToStorage, 
  triggerDocumentAnalysis,
  createNotification
} from '../utils/uploadProcessor';
import { detectDocumentType, getDocumentFormType } from '../utils/fileTypeDetector';
import { checkForDuplicates, handleDuplicateAction, type DuplicateCheckResult } from '../utils/duplicateDetection';
import { createDocumentVersion } from '../utils/documentVersioning';

export const useFileUpload = (onUploadComplete: (documentId: string) => Promise<void> | void) => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{
    file: File;
    result: DuplicateCheckResult;
  } | null>(null);
  const { validateFile } = useFileValidator();

  const handleUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(5);
      setUploadStep("Checking for duplicates...");
      
      logger.info(`Starting upload process for: ${file.name}, size: ${file.size} bytes`);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to upload documents"
        });
        setIsUploading(false);
        return;
      }

      // Check for duplicates
      const duplicateResult = await checkForDuplicates(file, user.id);
      
      if (duplicateResult.isDuplicate) {
        setDuplicateInfo({ file, result: duplicateResult });
        setShowDuplicateDialog(true);
        setIsUploading(false);
        return;
      }

      // Continue with normal upload process
      await processUpload(file, user.id);

    } catch (error) {
      console.error('Upload error:', error);
      logger.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload document. Please try again.",
      });
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStep("");
      }, 1000);
    }
  }, [onUploadComplete, toast, validateFile]);

  const processUpload = async (file: File, userId: string) => {
    setUploadProgress(10);
    setUploadStep("Preparing document for upload...");

    // Detect document type
    const { isForm76, isForm47, isForm31, isExcel, isPDF } = detectDocumentType(file);
    const isSpecialForm = isForm31 || isForm47 || isForm76;
    
    logger.info(`Document type detected: ${
      isForm31 ? 'Form 31' : 
      isForm47 ? 'Form 47' : 
      isForm76 ? 'Form 76' : 
      isExcel ? 'Excel' : 
      isPDF ? 'PDF' : 'Standard document'
    }`);

    // Get form type from filename
    const formType = getDocumentFormType(file.name);

    // Create loading/progress simulation
    const processingSimulation = simulateProcessingStages(
      isSpecialForm, 
      isExcel, 
      setUploadProgress, 
      setUploadStep
    );

    // Create database record
    const documentMetadata: Record<string, any> = {
      originalName: file.name,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      folder: 'Uncategorized' // Default folder
    };
    
    if (formType) documentMetadata.formType = formType;
    else if (isForm31) documentMetadata.formType = 'form-31';
    else if (isForm47) documentMetadata.formType =  'form-47'  ;
    else if (isForm76) documentMetadata.formType = 'form-76';

    const { data: documentData, error: documentError } = await createDocumentRecord(
      file, 
      userId, 
      undefined, 
      isSpecialForm,
      documentMetadata
    );

    if (documentError) {
      throw documentError;
    }
    
    if (!documentData?.id) {
      throw new Error('Failed to create document record');
    }

    const documentId = String(documentData.id);
    logger.info(`Document record created with ID: ${documentId}`);

    // Prepare and upload file using a standardized format
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${documentId}/${cleanFileName}`;
    
    // Upload to storage
    const { error: uploadError } = await uploadToStorage(file, userId, filePath);

    if (uploadError) {
      throw uploadError;
    }
    
    logger.info(`Document uploaded to storage path: ${filePath}`);
    
    // Update document record with storage path and metadata
    const existingMetadata = documentData.metadata && typeof documentData.metadata === 'object' && documentData.metadata !== null 
      ? documentData.metadata as Record<string, any>
      : {};

    const { error: updateError } = await supabase
      .from('documents')
      .update({ 
        storage_path: filePath,
        metadata: {
          ...existingMetadata,
          storageFullPath: filePath
        },
        ai_processing_status: isSpecialForm ? 'pending' : 'complete'
      })
      .eq('id', documentId);

    if (updateError) {
      throw updateError;
    }

    // Create initial version record
    await createDocumentVersion(documentId, file, userId, 'Initial upload');

    // Create notification for upload started
    await createNotification(
      userId,
      'Document Upload Started',
      `"${file.name}" has been uploaded and is being processed`,
      'info',
      documentId,
      file.name,
      'upload_complete'
    );
    
    // Trigger document analysis for special forms or Excel files
    if (isSpecialForm || isExcel) {
      logger.info(`Initiating document analysis for ${documentId}`);
      await triggerDocumentAnalysis(documentId, file.name, isSpecialForm);
    }
    
    // Wait for processing simulation to complete
    await processingSimulation;

    // Call upload complete callback
    if (onUploadComplete) {
      logger.info(`Calling onUploadComplete with document ID: ${documentId}`);
      await onUploadComplete(documentId);
    }

    // Create final notification
    await createNotification(
      userId,
      'Document Processing Complete',
      `"${file.name}" has been fully processed`,
      'success',
      documentId,
      file.name,
      'complete'
    );

    // Success message
    toast({
      title: "Success",
      description: isSpecialForm
        ? `${file.name} uploaded and processed successfully`
        : "Document uploaded successfully",
    });
  };

  const handleDuplicateDecision = async (action: 'replace' | 'keep_both' | 'cancel') => {
    if (!duplicateInfo) return;

    try {
      setShowDuplicateDialog(false);
      
      if (action === 'cancel') {
        setDuplicateInfo(null);
        return;
      }

      setIsUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await handleDuplicateAction(
        action,
        duplicateInfo.file,
        duplicateInfo.result.existingDocumentId!,
        user.id
      );

      if (result.success) {
        toast({
          title: "Success",
          description: action === 'replace' 
            ? "Document version updated successfully"
            : "Document uploaded successfully"
        });

        if (onUploadComplete && result.documentId) {
          await onUploadComplete(result.documentId);
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to handle duplicate document"
        });
      }
    } catch (error) {
      console.error('Error handling duplicate:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process document"
      });
    } finally {
      setIsUploading(false);
      setDuplicateInfo(null);
    }
  };

  return {
    handleUpload,
    isUploading,
    uploadProgress,
    uploadStep,
    showDuplicateDialog,
    duplicateInfo,
    handleDuplicateDecision
  };
};

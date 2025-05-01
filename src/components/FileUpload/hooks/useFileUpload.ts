
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

export const useFileUpload = (onUploadComplete: (documentId: string) => Promise<void> | void) => {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { validateFile } = useFileValidator();

  const handleUpload = useCallback(async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(5);
      setUploadStep("Preparing document for upload...");
      
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
      const documentMetadata: any = {
        originalName: file.name,
        fileType: file.type,
        uploadedAt: new Date().toISOString()
      };
      
      if (formType) documentMetadata.formType = formType;
      else if (isForm31) documentMetadata.formType = 'form-31';
      else if (isForm47) documentMetadata.formType = 'form-47';
      else if (isForm76) documentMetadata.formType = 'form-76';

      const { data: documentData, error: documentError } = await createDocumentRecord(
        file, 
        user.id, 
        undefined, 
        isSpecialForm,
        documentMetadata
      );

      if (documentError) {
        throw documentError;
      }
      
      logger.info(`Document record created with ID: ${documentData.id}`);

      // Prepare and upload file using a standardized format
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${user.id}/${documentData.id}/${cleanFileName}`;
      
      // Upload to storage
      const { error: uploadError } = await uploadToStorage(file, user.id, filePath);

      if (uploadError) {
        throw uploadError;
      }
      
      logger.info(`Document uploaded to storage path: ${filePath}`);
      
      // Update document record with storage path and metadata
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          storage_path: filePath,
          metadata: {
            ...documentData.metadata,
            storageFullPath: filePath
          },
          ai_processing_status: isSpecialForm ? 'pending' : 'complete'
        })
        .eq('id', documentData.id);

      if (updateError) {
        throw updateError;
      }

      // Create notification for upload started
      await createNotification(
        user.id,
        'Document Upload Started',
        `"${file.name}" has been uploaded and is being processed`,
        'info',
        documentData.id,
        file.name,
        'upload_complete'
      );
      
      // Trigger document analysis for special forms or Excel files
      if (isSpecialForm || isExcel) {
        logger.info(`Initiating document analysis for ${documentData.id}`);
        // Fix: Remove the boolean flag that was causing the error (too many arguments)
        await triggerDocumentAnalysis(documentData.id, file.name, isSpecialForm);
      }
      
      // Wait for processing simulation to complete
      await processingSimulation;

      // Call upload complete callback
      if (onUploadComplete) {
        logger.info(`Calling onUploadComplete with document ID: ${documentData.id}`);
        await onUploadComplete(documentData.id);
      }

      // Create final notification
      await createNotification(
        user.id,
        'Document Processing Complete',
        `"${file.name}" has been fully processed`,
        'success',
        documentData.id,
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

  return {
    handleUpload,
    isUploading,
    uploadProgress,
    uploadStep
  };
};


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
import { detectDocumentType } from '../utils/fileTypeDetector';
import { isForm31Document, createForm31RiskAssessment } from '@/utils/documents/analysisUtils';

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

      const isForm31ByName = file.name.toLowerCase().includes("form 31") || 
                            file.name.toLowerCase().includes("form31") ||
                            file.name.toLowerCase().includes("proof of claim");
      
      const { isForm76, isExcel } = detectDocumentType(file);
      
      logger.info(`Document type detected: ${isForm31ByName ? 'Form 31' : isForm76 ? 'Form 76' : isExcel ? 'Excel' : 'Standard document'}`);

      const processingSimulation = simulateProcessingStages(
        isForm31ByName || isForm76, 
        isExcel, 
        setUploadProgress, 
        setUploadStep
      );

      const { data: documentData, error: documentError } = await createDocumentRecord(
        file, 
        user.id, 
        undefined, 
        isForm31ByName || isForm76
      );

      if (documentError) {
        throw documentError;
      }
      
      logger.info(`Document record created with ID: ${documentData.id}`);

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const filePath = `${user.id}/${documentData.id}/${timestamp}_${cleanFileName}`;
      
      const { error: uploadError } = await uploadToStorage(file, user.id, filePath);

      if (uploadError) {
        throw uploadError;
      }
      
      logger.info(`Document uploaded to storage path: ${filePath}`);

      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          storage_path: filePath,
          metadata: {
            ...documentData.metadata,
            originalName: file.name,
            documentType: isForm31ByName ? 'form-31' : isForm76 ? 'form-76' : 'unknown',
            fileType: file.type,
            uploadedAt: new Date().toISOString(),
            storageFullPath: filePath
          }
        })
        .eq('id', documentData.id);

      if (updateError) {
        throw updateError;
      }

      await createNotification(
        user.id,
        'Document Upload Started',
        `"${file.name}" has been uploaded and is being processed`,
        'info',
        documentData.id,
        file.name,
        'upload_complete'
      );
      
      if (isForm31ByName) {
        logger.info('Creating Form 31 analysis...');
        try {
          await createForm31RiskAssessment(documentData.id);
          logger.info('Form 31 analysis created successfully');
          
          await createNotification(
            user.id,
            'Form 31 Analysis Complete',
            `Proof of Claim form has been analyzed successfully`,
            'success',
            documentData.id,
            file.name,
            'analysis_complete'
          );
        } catch (error) {
          logger.error('Error creating Form 31 analysis:', error);
        }
      } else {
        await triggerDocumentAnalysis(documentData.id, file.name, isForm76);
      }

      try {
        const { data: fileData, error: fileCheckError } = await supabase
          .storage
          .from('documents')
          .list(filePath.split('/').slice(0, -1).join('/'));
          
        if (fileCheckError || !fileData || fileData.length === 0) {
          logger.warn(`File upload verification failed. Path: ${filePath}`);
          toast({
            variant: "default", // Changed from "warning" to "default"
            title: "Warning",
            description: "Document was saved but may have issues with preview. Please check the document viewer.",
          });
        }
      } catch (verifyError) {
        logger.error('Error verifying file upload:', verifyError);
      }

      await processingSimulation;

      if (onUploadComplete) {
        logger.info(`Calling onUploadComplete with document ID: ${documentData.id}`);
        await onUploadComplete(documentData.id);
      }

      await createNotification(
        user.id,
        'Document Processing Complete',
        `"${file.name}" has been fully processed`,
        'success',
        documentData.id,
        file.name,
        'complete'
      );

      toast({
        title: "Success",
        description: isForm31ByName
          ? "Form 31 uploaded and analyzed successfully" 
          : isForm76 
            ? "Form 76 uploaded and analyzed successfully" 
            : "Document uploaded and processed successfully",
      });
    } catch (error) {
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
      }, 3000);
    }
  }, [onUploadComplete, toast, validateFile]);

  return {
    handleUpload,
    isUploading,
    uploadProgress,
    uploadStep
  };
};


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

      // Get user ID for document ownership
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

      // Enhanced Form 31 detection - check file name
      const isForm31ByName = file.name.toLowerCase().includes("form 31") || 
                            file.name.toLowerCase().includes("form31") ||
                            file.name.toLowerCase().includes("proof of claim");
      
      // Detect other file types
      const { isForm76, isExcel } = detectDocumentType(file);
      
      // Log what type of document we think this is
      logger.info(`Document type detected: ${isForm31ByName ? 'Form 31' : isForm76 ? 'Form 76' : isExcel ? 'Excel' : 'Standard document'}`);

      // Start processing stage simulation (runs in parallel with actual upload)
      const processingSimulation = simulateProcessingStages(
        isForm31ByName || isForm76, 
        isExcel, 
        setUploadProgress, 
        setUploadStep
      );

      // Create database record
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

      // Upload file to storage
      const filePath = `${user.id}/${documentData.id}/${file.name}`;
      const { error: uploadError } = await uploadToStorage(file, user.id, filePath);

      if (uploadError) {
        throw uploadError;
      }

      // Update document with storage path
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          storage_path: filePath,
          // Add metadata to help with detection
          metadata: {
            ...documentData.metadata,
            originalName: file.name,
            documentType: isForm31ByName ? 'form-31' : isForm76 ? 'form-76' : 'unknown',
            fileType: file.type,
            uploadedAt: new Date().toISOString()
          }
        })
        .eq('id', documentData.id);

      if (updateError) {
        throw updateError;
      }

      // Create notification for document upload
      await createNotification(
        user.id,
        'Document Upload Started',
        `"${file.name}" has been uploaded and is being processed`,
        'info',
        documentData.id,
        file.name,
        'upload_complete'
      );
      
      // If it's Form 31, create complete analysis with all fields
      if (isForm31ByName) {
        logger.info('Creating Form 31 analysis...');
        try {
          await createForm31RiskAssessment(documentData.id);
          logger.info('Form 31 analysis created successfully');
          
          // Create success notification for Form 31
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
          // Continue anyway to not block the upload
        }
      } else {
        // Trigger document analysis for other document types
        await triggerDocumentAnalysis(documentData.id, file.name, isForm76);
      }

      // Wait for processing simulation to complete
      await processingSimulation;

      // Call the completion callback with the document ID
      if (onUploadComplete) {
        logger.info(`Calling onUploadComplete with document ID: ${documentData.id}`);
        await onUploadComplete(documentData.id);
      }

      // Create notification for successful processing
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
      // Delay resetting the state to let users see the completion message
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStep("");
      }, 3000); // Show completion for 3 seconds
    }
  }, [onUploadComplete, toast, validateFile]);

  return {
    handleUpload,
    isUploading,
    uploadProgress,
    uploadStep
  };
};

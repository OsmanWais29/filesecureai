
import { useState, useCallback } from 'react';
import { DeepSeekAnalysisOrchestrator } from '@/services/DeepSeekAnalysisOrchestrator';
import { DuplicatePreventionService } from '@/services/DuplicatePreventionService';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface UseEnhancedFileUploadOptions {
  onUploadComplete?: (documentId: string) => void;
  onDuplicateDetected?: (duplicateInfo: any) => void;
  autoProcess?: boolean;
  clientHint?: string;
}

export const useEnhancedFileUpload = (options: UseEnhancedFileUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>('');
  const [pipeline, setPipeline] = useState<any>(null);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Authentication required', {
        description: 'Please log in to upload documents'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setCurrentStage('Starting upload...');

    try {
      // Enhanced file upload with comprehensive processing
      const result = await DeepSeekAnalysisOrchestrator.processDocumentPipeline(
        file,
        user.id,
        {
          skipDuplicateCheck: false,
          forceAnalysis: false,
          clientHint: options.clientHint
        }
      );

      if (!result.success) {
        if (result.pipeline?.errors.includes('Duplicate file detected')) {
          // Handle duplicate detection
          const duplicateResult = await DuplicatePreventionService.checkForDuplicates(file, user.id);
          setDuplicateInfo({ file, result: duplicateResult });
          setShowDuplicateDialog(true);
          setIsUploading(false);
          return;
        }

        throw new Error(result.pipeline?.errors.join(', ') || 'Upload failed');
      }

      setPipeline(result.pipeline);
      
      // Monitor pipeline progress
      if (result.documentId) {
        await monitorPipelineProgress(result.documentId);
        options.onUploadComplete?.(result.documentId);
      }

    } catch (error) {
      console.error('Enhanced file upload failed:', error);
      toast.error('Upload failed', {
        description: error.message
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
      setCurrentStage('Complete');
    }
  }, [options]);

  const monitorPipelineProgress = async (documentId: string) => {
    const interval = setInterval(async () => {
      const status = await DeepSeekAnalysisOrchestrator.getPipelineStatus(documentId);
      
      if (status) {
        setUploadProgress(status.progress);
        setCurrentStage(status.stage);
        setPipeline(status);
        
        if (status.progress >= 100 || status.stage === 'complete') {
          clearInterval(interval);
        }
      }
    }, 1000);

    // Clear interval after 30 seconds to prevent infinite polling
    setTimeout(() => clearInterval(interval), 30000);
  };

  const handleDuplicateDecision = async (action: 'replace' | 'version' | 'rename' | 'cancel') => {
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

      const result = await DuplicatePreventionService.handleDuplicateResolution(
        action,
        duplicateInfo.file,
        duplicateInfo.result.existingDocuments[0]?.id,
        action === 'rename' ? `${duplicateInfo.file.name}_copy` : undefined
      );

      if (result.proceed) {
        // Process with the resolved duplicate
        const processingOptions = {
          ...options,
          skipDuplicateCheck: true,
          forceAnalysis: action === 'replace'
        };

        if (action === 'version' && duplicateInfo.result.existingDocuments[0]?.id) {
          // Handle version creation
          toast.success('Creating new version...');
          // This would integrate with FileVersioningService
        } else {
          // Handle normal upload with resolved name
          await handleFileUpload(duplicateInfo.file);
        }
      }
    } catch (error) {
      console.error('Error handling duplicate:', error);
      toast.error('Failed to resolve duplicate', {
        description: error.message
      });
    } finally {
      setIsUploading(false);
      setDuplicateInfo(null);
    }
  };

  return {
    handleFileUpload,
    isUploading,
    uploadProgress,
    currentStage,
    pipeline,
    showDuplicateDialog,
    duplicateInfo,
    handleDuplicateDecision
  };
};

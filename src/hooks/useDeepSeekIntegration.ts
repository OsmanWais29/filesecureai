
import { useState, useCallback } from 'react';
import { DeepSeekCoreService, DeepSeekAnalysisResult } from '@/services/DeepSeekCoreService';
import { DocumentProcessingPipelineService } from '@/services/DocumentProcessingPipeline';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const useDeepSeekIntegration = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DeepSeekAnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const analyzeDocument = useCallback(async (documentId: string) => {
    setIsAnalyzing(true);
    try {
      const result = await DeepSeekCoreService.analyzeDocument(documentId);
      setAnalysisResult(result);
      return result;
    } catch (error) {
      console.error('DeepSeek analysis failed:', error);
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const uploadWithDeepSeekAnalysis = useCallback(async (file: File, clientHint?: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Monitor progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 95));
      }, 500);

      const result = await DocumentProcessingPipelineService.processDocument(file, user.id, {
        clientHint,
        forceAnalysis: true
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.pipeline?.metadata?.analysis) {
        setAnalysisResult(result.pipeline.metadata.analysis);
      }

      return result;
    } catch (error) {
      console.error('Upload with DeepSeek analysis failed:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
      return { success: false };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const getStoredAnalysis = useCallback(async (documentId: string) => {
    try {
      const result = await DeepSeekCoreService.getAnalysis(documentId);
      setAnalysisResult(result);
      return result;
    } catch (error) {
      console.error('Failed to get stored analysis:', error);
      return null;
    }
  }, []);

  return {
    isAnalyzing,
    isUploading,
    analysisResult,
    uploadProgress,
    analyzeDocument,
    uploadWithDeepSeekAnalysis,
    getStoredAnalysis,
    setAnalysisResult
  };
};

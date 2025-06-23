
import { useState, useCallback } from 'react';
import { EnhancedDocumentAnalysis, EnhancedAnalysisResult } from '@/services/EnhancedDocumentAnalysis';
import { toast } from 'sonner';

export const useEnhancedAnalysis = (documentId?: string) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EnhancedAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDocument = useCallback(async (
    targetDocumentId?: string,
    options: {
      includeRiskAssessment?: boolean;
      includeComplianceCheck?: boolean;
      generateTasks?: boolean;
      customPrompt?: string;
    } = {}
  ) => {
    const docId = targetDocumentId || documentId;
    if (!docId) {
      toast.error('No document ID provided for analysis');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await EnhancedDocumentAnalysis.analyzeDocument(docId, options);
      setAnalysisResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      toast.error('Enhanced analysis failed', {
        description: errorMessage
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [documentId]);

  const loadAnalysisResults = useCallback(async (targetDocumentId?: string) => {
    const docId = targetDocumentId || documentId;
    if (!docId) return null;

    try {
      const result = await EnhancedDocumentAnalysis.getAnalysisResults(docId);
      setAnalysisResult(result);
      return result;
    } catch (err) {
      console.error('Failed to load analysis results:', err);
      return null;
    }
  }, [documentId]);

  const batchAnalyze = useCallback(async (documentIds: string[]) => {
    setIsAnalyzing(true);
    try {
      await EnhancedDocumentAnalysis.batchAnalyze(documentIds);
      toast.success(`Batch analysis started for ${documentIds.length} documents`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch analysis failed';
      setError(errorMessage);
      toast.error('Batch analysis failed', {
        description: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    error,
    analyzeDocument,
    loadAnalysisResults,
    batchAnalyze
  };
};


// React Hook for OSB Analysis
import { useState } from 'react';
import { DeepSeekAnalysisResponse } from '@/types/osb-analysis';
import { OSBAnalysisService } from '@/services/OSBAnalysisService';

export function useOSBAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');

  const analyzeDocument = async (
    documentText: string,
    formNumber?: string
  ): Promise<DeepSeekAnalysisResponse | null> => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress tracking
      setCurrentStep('Initializing analysis...');
      setProgress(10);

      setCurrentStep('Identifying form type...');
      setProgress(25);

      setCurrentStep('Extracting document data...');
      setProgress(50);

      setCurrentStep('Performing risk assessment...');
      setProgress(75);

      const result = await OSBAnalysisService.analyzeDocument(documentText, formNumber);

      setCurrentStep('Analysis complete');
      setProgress(100);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisById = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      return await OSBAnalysisService.getAnalysisById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analysis');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getHighRiskAnalyses = async () => {
    setLoading(true);
    setError(null);

    try {
      return await OSBAnalysisService.getHighRiskAnalyses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch high-risk analyses');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeDocument,
    getAnalysisById,
    getHighRiskAnalyses,
    loading,
    error,
    progress,
    currentStep
  };
}

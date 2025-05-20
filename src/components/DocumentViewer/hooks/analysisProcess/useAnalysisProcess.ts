
import { useState, useCallback } from 'react';
import { toast as showToast } from 'sonner';
import { dataExtraction } from './stages/dataExtraction';
import { documentClassification } from './stages/documentClassification';
import { useRiskAssessment } from './stages/riskAssessment';
import { toRecord } from '@/utils/typeSafetyUtils';

export const useAnalysisProcess = () => {
  const [analysisStep, setAnalysisStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState('');

  const analyzeDocument = useCallback(async (document: any) => {
    // Reset states
    setAnalysisStep('');
    setProgress(0);
    setError(null);
    setProcessingStage('');

    try {
      if (!document) {
        throw new Error('No document provided for analysis');
      }

      const context = {
        setAnalysisStep,
        setProgress,
        setError,
        setProcessingStage,
        toast: showToast,
        isForm47: false,
        isForm76: false,
        isForm31: false
      };

      // Detect form types from metadata
      const metadata = toRecord(document.metadata);
      const formType = metadata.formType ? String(metadata.formType) : '';
      
      // Set form type flags
      context.isForm47 = formType === 'form-47';
      context.isForm76 = formType === 'form-76';
      context.isForm31 = formType === 'form-31';

      // Run analysis stages
      await documentClassification(context, document);
      await dataExtraction(context, document);
      await useRiskAssessment(context, document);

      setAnalysisStep('Analysis complete');
      setProgress(100);
      return { success: true };
    } catch (err: any) {
      console.error('Analysis process error:', err);
      setError(err.message || 'An unknown error occurred during analysis');
      return { success: false, error: err };
    }
  }, []);

  return {
    analyzeDocument,
    analysisStep,
    progress,
    error,
    processingStage
  };
};

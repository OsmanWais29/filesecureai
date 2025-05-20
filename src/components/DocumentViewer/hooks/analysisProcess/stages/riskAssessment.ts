
import { AnalysisProcessContext } from '../types';
import { DocumentRecord } from '../../types';
import { updateAnalysisStatus } from '../documentStatusUpdates';
import { toRecord } from '@/utils/typeSafetyUtils';

export const useRiskAssessment = async (
  context: AnalysisProcessContext, 
  document: DocumentRecord
): Promise<void> => {
  const { setAnalysisStep, setProgress } = context;
  
  setAnalysisStep('Risk assessment');
  setProgress(75);
  
  // Using toRecord for safe object handling
  const metadata = toRecord(document.metadata);
  
  // Detect form types from metadata
  const isForm47 = Boolean(metadata.formType === 'form-47');
  const isForm76 = Boolean(metadata.formType === 'form-76');
  const isForm31 = Boolean(metadata.formType === 'form-31');
  
  // Update document with risk assessment status
  await updateAnalysisStatus(document, 'risk_assessment', 'completed');
};

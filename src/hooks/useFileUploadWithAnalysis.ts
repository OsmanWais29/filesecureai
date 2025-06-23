
import { useState } from 'react';
import { useFileUpload } from '@/components/FileUpload/hooks/useFileUpload';
import { AIDocumentAnalysisService } from '@/services/aiDocumentAnalysis';
import { AutoCategorizationService } from '@/services/autoCategorization';
import { toast } from 'sonner';

export const useFileUploadWithAnalysis = (onUploadComplete?: (result: any) => void) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const originalHook = useFileUpload((result) => {
    // After successful upload, trigger analysis
    if (result.success && result.documentId) {
      handlePostUploadAnalysis(result.documentId, result.fileName);
    }
    onUploadComplete?.(result);
  });

  const handlePostUploadAnalysis = async (documentId: string, fileName: string) => {
    setIsAnalyzing(true);
    try {
      // Check if document should be auto-analyzed (based on file name patterns)
      const shouldAnalyze = shouldTriggerAnalysis(fileName);
      
      if (shouldAnalyze) {
        toast.info('Analyzing document...', { 
          description: 'AI is extracting information and suggesting categorization' 
        });

        // Simulate document content extraction (in production, would extract from storage)
        const mockContent = `Document content for ${fileName}. This would be extracted from the actual file.`;
        
        // Perform AI analysis
        const analysisResult = await AIDocumentAnalysisService.analyzeDocument(
          documentId,
          mockContent,
          fileName
        );

        if (analysisResult) {
          // Generate categorization suggestion
          const suggestion = await AutoCategorizationService.categorizeDocument(documentId);
          
          if (suggestion && suggestion.confidenceLevel === 'high') {
            // Auto-apply high-confidence categorizations
            await AutoCategorizationService.applyCategorization(documentId, false);
            toast.success('Document automatically categorized', {
              description: `Moved to ${suggestion.suggestedClientFolder} > ${suggestion.suggestedFormCategory}`
            });
          } else if (suggestion) {
            toast.info('Categorization suggestion available', {
              description: 'Click the document to review the suggestion'
            });
          }
        }
      }
    } catch (error) {
      console.error('Post-upload analysis failed:', error);
      toast.error('Document uploaded but analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const shouldTriggerAnalysis = (fileName: string): boolean => {
    const lowerName = fileName.toLowerCase();
    const analysisPatterns = [
      'form', 'proposal', 'statement', 'bankruptcy', 'consumer',
      'income', 'expense', 'financial', 'assets', 'liabilities'
    ];
    
    return analysisPatterns.some(pattern => lowerName.includes(pattern));
  };

  return {
    ...originalHook,
    isAnalyzing
  };
};

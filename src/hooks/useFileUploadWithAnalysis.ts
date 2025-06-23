
import { useState } from 'react';
import { useFileUpload } from '@/components/FileUpload/hooks/useFileUpload';
import { DeepSeekDocumentAnalysisService } from '@/services/deepSeekDocumentAnalysis';
import { EnhancedAutoCategorizationService } from '@/services/enhancedAutoCategorization';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const useFileUploadWithAnalysis = (onUploadComplete?: (documentId: string) => void) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const originalHook = useFileUpload(async (documentId: string) => {
    // After successful upload, trigger enhanced analysis
    if (documentId) {
      await handlePostUploadAnalysis(documentId);
    }
    onUploadComplete?.(documentId);
  });

  const handlePostUploadAnalysis = async (documentId: string) => {
    setIsAnalyzing(true);
    try {
      // Get document details
      const { data: document, error } = await supabase
        .from('documents')
        .select('title, type, metadata')
        .eq('id', documentId)
        .single();

      if (error || !document) {
        console.error('Failed to get document details:', error);
        return;
      }

      const fileName = document.title;
      const fileType = document.type;
      
      // Check if document should be auto-analyzed
      const shouldAnalyze = shouldTriggerEnhancedAnalysis(fileName, fileType);
      
      if (shouldAnalyze) {
        toast.info('Analyzing document with DeepSeek AI...', { 
          description: 'Enhanced form recognition, OCR, and risk assessment in progress' 
        });

        // Perform enhanced DeepSeek analysis
        const analysisResult = await DeepSeekDocumentAnalysisService.analyzeDocument(documentId);

        if (analysisResult) {
          // Generate enhanced categorization suggestion
          const suggestion = await EnhancedAutoCategorizationService.categorizeDocument(documentId);
          
          if (suggestion) {
            // Auto-apply high-confidence, low-risk categorizations
            if (suggestion.confidenceLevel === 'high' && suggestion.riskLevel === 'low') {
              await EnhancedAutoCategorizationService.applyEnhancedCategorization(documentId, false);
              toast.success('Document automatically categorized', {
                description: `Moved to ${suggestion.suggestedClientFolder} > ${suggestion.suggestedFormCategory}`
              });
            } else {
              // Show suggestion for review
              const riskEmoji = suggestion.riskLevel === 'high' ? '⚠️' : suggestion.riskLevel === 'medium' ? '⚡' : '✅';
              toast.info('Enhanced categorization suggestion available', {
                description: `${riskEmoji} Form ${suggestion.formNumber} detected - Click document to review`
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Enhanced post-upload analysis failed:', error);
      toast.error('Document uploaded but enhanced analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced analysis trigger logic
  const shouldTriggerEnhancedAnalysis = (fileName: string, fileType?: string): boolean => {
    const lowerName = fileName.toLowerCase();
    
    // Enhanced patterns for all BIA forms and common document types
    const enhancedAnalysisPatterns = [
      'form', 'proposal', 'statement', 'bankruptcy', 'consumer',
      'income', 'expense', 'financial', 'assets', 'liabilities',
      'proof', 'claim', 'creditor', 'debtor', 'trustee',
      'assignment', 'notice', 'certificate', 'dividend',
      'receipt', 'security', 'appointment', 'affairs'
    ];
    
    // Check file type for documents that should be analyzed
    const supportedTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const hasValidType = !fileType || supportedTypes.some(type => 
      fileType.toLowerCase().includes(type)
    );
    
    // BIA form number patterns (Forms 1-96)
    const formNumberPattern = /form\s*\d{1,2}/i;
    
    return hasValidType && (
      enhancedAnalysisPatterns.some(pattern => lowerName.includes(pattern)) ||
      formNumberPattern.test(lowerName)
    );
  };

  return {
    ...originalHook,
    isAnalyzing
  };
};

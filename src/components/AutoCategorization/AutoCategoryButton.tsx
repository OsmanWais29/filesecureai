
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Zap } from 'lucide-react';
import { CategorizationDialog } from './CategorizationDialog';
import { EnhancedAutoCategorizationService } from '@/services/enhancedAutoCategorization';
import { DeepSeekDocumentAnalysisService } from '@/services/deepSeekDocumentAnalysis';
import { toast } from 'sonner';

interface AutoCategoryButtonProps {
  documentId: string;
  documentTitle: string;    
  onSuccess?: () => void;
}

export const AutoCategoryButton: React.FC<AutoCategoryButtonProps> = ({
  documentId,
  documentTitle,
  onSuccess
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleEnhancedAutoCategory = async () => {
    setIsAnalyzing(true);
    try {
      // Check if we already have enhanced analysis
      let analysis = await DeepSeekDocumentAnalysisService.getDocumentAnalysis(documentId);
      
      if (!analysis) {
        toast.info('Running enhanced DeepSeek analysis...', { 
          description: 'OCR processing, form recognition, and risk assessment' 
        });
        
        // Perform enhanced DeepSeek analysis
        const result = await DeepSeekDocumentAnalysisService.analyzeDocument(documentId);
        
        if (!result) {
          toast.error('Enhanced document analysis failed');
          return;
        }
      }

      // Generate enhanced categorization suggestion
      const categorySuggestion = await EnhancedAutoCategorizationService.categorizeDocument(documentId);
      
      if (!categorySuggestion) {
        toast.error('Failed to generate enhanced categorization suggestion');
        return;
      }

      setSuggestion(categorySuggestion);
      setShowDialog(true);
      
    } catch (error) {
      console.error('Enhanced auto-categorization failed:', error);
      toast.error('Enhanced auto-categorization failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    setIsApplying(true);
    try {
      const success = await EnhancedAutoCategorizationService.applyEnhancedCategorization(
        documentId, 
        true,
        suggestion?.riskLevel === 'high' // Override risk if user manually approves
      );
      if (success) {
        setShowDialog(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to apply enhanced categorization:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReject = () => {
    setShowDialog(false);
    setSuggestion(null);
    toast.info('Enhanced categorization suggestion rejected');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEnhancedAutoCategory}
        disabled={isAnalyzing}
        className="gap-2"
      >
        {isAnalyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
        {isAnalyzing ? 'Analyzing...' : 'Enhanced AI Analysis'}
      </Button>

      <CategorizationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        suggestion={suggestion}
        onApprove={handleApprove}
        onReject={handleReject}
        isApplying={isApplying}
      />
    </>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { CategorizationDialog } from './CategorizationDialog';
import { AIDocumentAnalysisService } from '@/services/aiDocumentAnalysis';
import { AutoCategorizationService } from '@/services/autoCategorization';
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

  const handleAutoCategory = async () => {
    setIsAnalyzing(true);
    try {
      // First check if we already have analysis
      let analysis = await AIDocumentAnalysisService.getDocumentAnalysis(documentId);
      
      if (!analysis) {
        toast.info('Analyzing document...', { description: 'This may take a few moments' });
        
        // Simulate document content extraction (in production, would extract from storage)
        const mockContent = `Document analysis for ${documentTitle}. This is placeholder content for demonstration.`;
        
        // Perform AI analysis
        const result = await AIDocumentAnalysisService.analyzeDocument(
          documentId, 
          mockContent, 
          documentTitle
        );
        
        if (!result) {
          toast.error('Failed to analyze document');
          return;
        }
      }

      // Generate categorization suggestion
      const categorySuggestion = await AutoCategorizationService.categorizeDocument(documentId);
      
      if (!categorySuggestion) {
        toast.error('Failed to generate categorization suggestion');
        return;
      }

      setSuggestion(categorySuggestion);
      setShowDialog(true);
      
    } catch (error) {
      console.error('Auto-categorization failed:', error);
      toast.error('Auto-categorization failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApprove = async () => {
    setIsApplying(true);
    try {
      const success = await AutoCategorizationService.applyCategorization(documentId, true);
      if (success) {
        setShowDialog(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Failed to apply categorization:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleReject = () => {
    setShowDialog(false);
    setSuggestion(null);
    toast.info('Categorization suggestion rejected');
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAutoCategory}
        disabled={isAnalyzing}
        className="gap-2"
      >
        {isAnalyzing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {isAnalyzing ? 'Analyzing...' : 'Auto-Categorize'}
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

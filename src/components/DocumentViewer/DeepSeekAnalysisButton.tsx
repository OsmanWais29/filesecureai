
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { OSBAnalysisService } from '@/services/OSBAnalysisService';
import { toast } from 'sonner';

interface DeepSeekAnalysisButtonProps {
  documentId: string;
  hasAnalysis: boolean;
  onAnalysisComplete: () => void;
  className?: string;
}

export const DeepSeekAnalysisButton: React.FC<DeepSeekAnalysisButtonProps> = ({
  documentId,
  hasAnalysis,
  onAnalysisComplete,
  className = ''
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleTriggerAnalysis = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisStatus('processing');

    try {
      toast.info('Starting DeepSeek AI analysis...', {
        description: 'This may take a few moments'
      });

      const result = await OSBAnalysisService.triggerDeepSeekAnalysis(documentId);

      if (result.success) {
        setAnalysisStatus('success');
        toast.success('DeepSeek analysis completed!', {
          description: 'Document analysis has been updated with new insights'
        });
        
        // Trigger callback to refresh the document viewer
        onAnalysisComplete();
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('DeepSeek analysis failed:', error);
      setAnalysisStatus('error');
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsAnalyzing(false);
      
      // Reset status after a delay
      setTimeout(() => {
        setAnalysisStatus('idle');
      }, 3000);
    }
  };

  const getButtonContent = () => {
    if (isAnalyzing) {
      return (
        <>
          <LoadingSpinner size="small" className="mr-2" />
          Analyzing...
        </>
      );
    }

    if (analysisStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Analysis Complete
        </>
      );
    }

    if (analysisStatus === 'error') {
      return (
        <>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Try Again
        </>
      );
    }

    return (
      <>
        <Zap className="h-4 w-4 mr-2" />
        {hasAnalysis ? 'Enhance Analysis' : 'Analyze with AI'}
      </>
    );
  };

  const getButtonVariant = () => {
    if (analysisStatus === 'success') return 'default';
    if (analysisStatus === 'error') return 'destructive';
    if (!hasAnalysis) return 'default';
    return 'outline';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleTriggerAnalysis}
        disabled={isAnalyzing}
        variant={getButtonVariant()}
        size="sm"
        className="transition-all duration-200"
      >
        {getButtonContent()}
      </Button>
      
      {!hasAnalysis && (
        <Badge variant="secondary" className="text-xs">
          No Analysis
        </Badge>
      )}
      
      {hasAnalysis && analysisStatus === 'idle' && (
        <Badge variant="outline" className="text-xs">
          Enhance
        </Badge>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Zap, CheckCircle } from 'lucide-react';
import { OSBAnalysisService } from '@/services/OSBAnalysisService';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';

interface DeepSeekAnalysisButtonProps {
  documentId: string;
  hasAnalysis?: boolean;
  onAnalysisComplete?: () => void;
  className?: string;
}

export const DeepSeekAnalysisButton: React.FC<DeepSeekAnalysisButtonProps> = ({
  documentId,
  hasAnalysis = false,
  onAnalysisComplete = () => {},
  className
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      toast.info('Starting DeepSeek AI analysis...', {
        description: 'Enhanced reasoning and reinforcement learning in progress'
      });

      const result = await OSBAnalysisService.triggerDeepSeekAnalysis(documentId);

      if (result.success) {
        toast.success('DeepSeek analysis completed!', {
          description: 'Document analysis enhanced with AI reasoning'
        });
        onAnalysisComplete();
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('DeepSeek analysis failed:', error);
      toast.error('Analysis failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (hasAnalysis) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className={cn("flex items-center gap-2", className)}
      >
        {isAnalyzing ? (
          <>
            <LoadingSpinner size="small" />
            Re-analyzing...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4" />
            Re-analyze with DeepSeek
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      className={cn("flex items-center gap-2 bg-blue-600 hover:bg-blue-700", className)}
    >
      {isAnalyzing ? (
        <>
          <LoadingSpinner size="small" />
          Analyzing...
        </>
      ) : (
        <>
          <Zap className="h-4 w-4" />
          Analyze with DeepSeek AI
        </>
      )}
    </Button>
  );
};


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Zap, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { OSBAnalysisService } from '@/services/OSBAnalysisService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [showPromptSystem, setShowPromptSystem] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleTriggerAnalysis = async (prompt?: string) => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisStatus('processing');

    try {
      toast.info('Starting DeepSeek AI reasoning analysis...', {
        description: 'Enhanced reinforcement learning in progress'
      });

      const result = await OSBAnalysisService.triggerDeepSeekAnalysis(documentId, prompt);

      if (result.success) {
        setAnalysisStatus('success');
        toast.success('DeepSeek reasoning analysis completed!', {
          description: 'Document analysis enhanced with reinforcement learning'
        });
        
        onAnalysisComplete();
        setShowPromptSystem(false);
        setCustomPrompt('');
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
          Reasoning...
        </>
      );
    }

    if (analysisStatus === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Analysis Enhanced
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
        <Brain className="h-4 w-4 mr-2" />
        {hasAnalysis ? 'Enhance with DeepSeek' : 'Analyze with DeepSeek AI'}
      </>
    );
  };

  const getButtonVariant = () => {
    if (analysisStatus === 'success') return 'default';
    if (analysisStatus === 'error') return 'destructive';
    if (!hasAnalysis) return 'default';
    return 'outline';
  };

  if (showPromptSystem) {
    return (
      <Card className={`${className} border-blue-200 bg-blue-50/50`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="h-4 w-4 mr-2 text-blue-600" />
            DeepSeek AI Reasoning System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Custom Analysis Prompt (optional):
            </label>
            <Input
              placeholder="e.g., Focus on compliance risks, Check for missing signatures, Analyze financial data..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="text-sm"
              disabled={isAnalyzing}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleTriggerAnalysis(customPrompt || undefined)}
              disabled={isAnalyzing}
              variant={getButtonVariant()}
              size="sm"
              className="flex-1"
            >
              {getButtonContent()}
            </Button>
            
            <Button
              onClick={() => setShowPromptSystem(false)}
              variant="outline"
              size="sm"
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            💡 DeepSeek will use reinforcement learning to enhance analysis accuracy
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={() => setShowPromptSystem(true)}
        disabled={isAnalyzing}
        variant={getButtonVariant()}
        size="sm"
        className="transition-all duration-200"
      >
        {getButtonContent()}
      </Button>
      
      {!hasAnalysis && (
        <Badge variant="secondary" className="text-xs">
          <Zap className="h-3 w-3 mr-1" />
          AI Ready
        </Badge>
      )}
      
      {hasAnalysis && analysisStatus === 'idle' && (
        <Badge variant="outline" className="text-xs">
          <Brain className="h-3 w-3 mr-1" />
          Enhance
        </Badge>
      )}
    </div>
  );
};

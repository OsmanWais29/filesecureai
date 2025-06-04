
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Brain, ArrowLeft, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { OSBAnalysisService } from '@/services/OSBAnalysisService';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface DeepSeekPromptingEngineProps {
  documentId: string;
  documentTitle: string;
  onAnalysisComplete: (reasoning: string) => void;
  onBack: () => void;
}

export const DeepSeekPromptingEngine: React.FC<DeepSeekPromptingEngineProps> = ({
  documentId,
  documentTitle,
  onAnalysisComplete,
  onBack
}) => {
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const suggestedPrompts = [
    "Focus on compliance risks and missing signatures",
    "Analyze financial data accuracy and calculations",
    "Check for BIA regulatory compliance issues",
    "Identify missing required fields and documentation",
    "Review dates consistency and timeline compliance"
  ];

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for the analysis');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      toast.info('Starting DeepSeek AI reasoning analysis...', {
        description: 'Enhanced reinforcement learning in progress'
      });

      const result = await OSBAnalysisService.triggerDeepSeekAnalysis(documentId, prompt);

      if (result.success) {
        setReasoning(result.reasoning || 'Analysis completed successfully');
        setAnalysisComplete(true);
        
        toast.success('DeepSeek reasoning analysis completed!', {
          description: 'Document analysis enhanced with reinforcement learning'
        });
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

  const handleViewResults = () => {
    if (reasoning) {
      onAnalysisComplete(reasoning);
    }
  };

  if (analysisComplete && reasoning) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">DeepSeek Reasoning:</h4>
              <div className="bg-white p-3 rounded-md border text-sm max-h-40 overflow-y-auto">
                {reasoning}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleViewResults}
                className="flex-1"
                size="sm"
              >
                <Brain className="h-4 w-4 mr-2" />
                Apply Reinforcement Learning
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              💡 Clicking "Apply Reinforcement Learning" will update the document details and risk assessment based on the AI reasoning.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
          disabled={isAnalyzing}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center">
            <Brain className="h-4 w-4 mr-2 text-blue-600" />
            DeepSeek AI Reasoning Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">
              Document: {documentTitle}
            </label>
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">
              Analysis Prompt:
            </label>
            <Textarea
              placeholder="Describe what you want the AI to focus on when analyzing this document..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="text-sm min-h-20"
              disabled={isAnalyzing}
            />
          </div>

          <div>
            <label className="text-xs font-medium mb-2 block">
              Suggested Prompts:
            </label>
            <div className="space-y-1">
              {suggestedPrompts.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  disabled={isAnalyzing}
                  className="text-left text-xs p-2 border rounded-md hover:bg-muted/50 w-full transition-colors disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !prompt.trim()}
            className="w-full"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <LoadingSpinner size="small" className="mr-2" />
                Reasoning...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Start AI Reasoning Analysis
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            💡 DeepSeek will use advanced reasoning to analyze your document and provide detailed insights with reinforcement learning.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

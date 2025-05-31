
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface OSBAnalysisProgressProps {
  loading: boolean;
  progress: number;
  currentStep: string;
  error?: string | null;
}

export const OSBAnalysisProgress: React.FC<OSBAnalysisProgressProps> = ({
  loading,
  progress,
  currentStep,
  error
}) => {
  if (!loading && !error && progress === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {error ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : loading ? (
            <Clock className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          OSB Document Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-red-600 font-medium">
            Analysis failed: {error}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <div className="text-sm text-muted-foreground">
              {loading ? 
                'Analyzing document with enhanced DeepSeek AI...' : 
                'Analysis completed successfully!'
              }
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

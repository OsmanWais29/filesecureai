
import React from "react";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisProgressProps {
  documentId: string;
  progress: number;
  analysisStep: string;
  processingStage: string;
  onComplete?: () => void;
  onRetry?: () => void; // Added retry capability
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  documentId,
  progress,
  analysisStep,
  processingStage,
  onComplete,
  onRetry
}) => {
  // Format the processing stage for display
  const formatProcessingStage = (stage: string): string => {
    return stage
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Check if analysis might be stuck
  const isAnalysisStuck = progress > 10 && progress < 100 && progress === Math.round(progress);

  return (
    <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium">Document Analysis</h3>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      
      <Progress value={progress} className="h-2 mb-2" />
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground">
          <span>{formatProcessingStage(processingStage)}</span>
          <span className="mx-1">-</span>
          <span>{analysisStep}</span>
        </div>
        
        {/* Add retry button if onRetry is provided or analysis is stuck */}
        {(onRetry || isAnalysisStuck) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRetry}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Restart
          </Button>
        )}
      </div>
      
      {/* Add warning for stuck analysis */}
      {isAnalysisStuck && (
        <div className="mt-2 flex items-center text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span>
            Analysis may be taking longer than expected. You can continue viewing the document or restart the analysis.
          </span>
        </div>
      )}
    </div>
  );
};

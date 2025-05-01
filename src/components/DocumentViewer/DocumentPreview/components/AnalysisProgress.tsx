
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, RefreshCw, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisProgressProps {
  documentId: string;
  progress: number;
  analysisStep: string;
  processingStage: string;
  onComplete?: () => void;
  onRetry?: () => void;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  documentId,
  progress,
  analysisStep,
  processingStage,
  onComplete,
  onRetry
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  
  // Format the processing stage for display
  const formatProcessingStage = (stage: string): string => {
    return stage
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Track elapsed time during analysis
  useEffect(() => {
    let interval: number | null = null;
    
    if (progress > 0 && progress < 100) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          // If we've been processing for more than 2 minutes with no progress update, consider it stuck
          if (newTime > 120) {
            setIsStuck(true);
          }
          return newTime;
        });
      }, 1000);
    } else {
      setElapsedTime(0);
      setIsStuck(false);
    }
    
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [progress]);

  // Format elapsed time
  const formatElapsedTime = (): string => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="mb-4 p-4 border border-border rounded-lg bg-muted/30">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm font-medium">Document Analysis</h3>
        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      
      <Progress value={progress} className="h-2 mb-2" />
      
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            <span>{formatProcessingStage(processingStage)}</span>
            <span className="mx-1">-</span>
            <span>{analysisStep}</span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Timer className="h-3 w-3 mr-1" />
            <span>{formatElapsedTime()}</span>
          </div>
        </div>
        
        {/* Retry button and warning */}
        {(isStuck || elapsedTime > 90) && (
          <div className="flex flex-col space-y-2 mt-2">
            <div className="flex items-start text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
              <span>
                Analysis may be taking longer than expected. This could be due to a large document or high server load.
                You can continue viewing the document or restart the analysis.
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="text-xs h-7 px-2 w-full text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Restart Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

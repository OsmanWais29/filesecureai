
import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, RefreshCw, Timer, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [connectionOk, setConnectionOk] = useState(true);
  
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
          } else if (newTime > 45 && !connectionChecked) {
            // After 45 seconds, check the connection status
            checkConnectionStatus();
          }
          return newTime;
        });
      }, 1000);
    } else if (progress >= 100) {
      // Analysis is complete
      setElapsedTime(0);
      setIsStuck(false);
      if (onComplete) {
        onComplete();
      }
    } else {
      setElapsedTime(0);
      setIsStuck(false);
    }
    
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [progress, onComplete, connectionChecked]);

  // Format elapsed time
  const formatElapsedTime = (): string => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Check if we can connect to the Supabase API
  const checkConnectionStatus = async () => {
    try {
      // Try to call a simple API to check connection
      const { data, error } = await supabase.functions.invoke('process-ai-request', {
        body: { ping: true }
      });
      
      setConnectionChecked(true);
      
      if (error) {
        console.error("API connection check failed:", error);
        setConnectionOk(false);
        toast.error("Connection to analysis service failed. This may cause delays in processing.");
      } else {
        setConnectionOk(true);
        console.log("API connection check successful");
      }
    } catch (err) {
      console.error("Error checking API connection:", err);
      setConnectionOk(false);
      setConnectionChecked(true);
    }
  };

  // Handle analysis retry
  const handleRetry = () => {
    setElapsedTime(0);
    setIsStuck(false);
    setConnectionChecked(false);
    if (onRetry) {
      onRetry();
    }
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
        
        {/* Connection status indicator */}
        {connectionChecked && !connectionOk && (
          <div className="flex items-start text-xs text-amber-600 mt-1">
            <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span>
              Connection to the AI service appears to be slow. This may cause delays in processing.
            </span>
          </div>
        )}
        
        {/* Processing updates */}
        {progress > 0 && progress < 100 && !isStuck && (
          <div className="flex items-center text-xs text-green-600 mt-1">
            <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span>Processing in progress...</span>
          </div>
        )}
        
        {/* Retry button and warning */}
        {(isStuck || elapsedTime > 90) && (
          <div className="flex flex-col space-y-2 mt-2">
            <div className="flex items-start text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
              <span>
                Analysis may be taking longer than expected. This could be due to a large document, high server load, or a connection issue.
                You can continue viewing the document or restart the analysis.
              </span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
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

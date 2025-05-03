
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Info, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { ProcessingStatus as StatusType } from "./types";

interface ProcessingStatusProps {
  status: StatusType;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ status }) => {
  // Format elapsed time
  const formatElapsedTime = (startTime: Date) => {
    const elapsed = Date.now() - startTime.getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 
      ? `${minutes}m ${seconds % 60}s` 
      : `${seconds}s`;
  };

  // Format estimated time remaining
  const formatTimeRemaining = (ms?: number) => {
    if (!ms) return "Calculating...";
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    return minutes > 0 
      ? `${minutes}m ${seconds % 60}s` 
      : `${seconds}s`;
  };

  // Get status icon
  const getStageIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'processing':
        return <Info className="h-5 w-5 text-primary" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-base font-semibold">Processing Progress</h3>
            </div>
            <span className="text-sm text-muted-foreground">
              Elapsed: {formatElapsedTime(status.startTime)}
            </span>
          </div>

          <Progress value={status.overallProgress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress: {Math.round(status.overallProgress)}%</span>
            {status.estimatedTimeRemaining && (
              <span>
                Remaining: {formatTimeRemaining(status.estimatedTimeRemaining)}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Processing Stages</h4>
          <div className="space-y-2">
            {status.stages.map((stage) => (
              <div key={stage.id} className="flex items-center space-x-2">
                {getStageIcon(stage.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={stage.status === 'processing' ? "font-medium" : ""}>
                      {stage.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(stage.progress)}%
                    </span>
                  </div>
                  <Progress 
                    value={stage.progress} 
                    className={`h-1 ${
                      stage.status === 'complete' 
                        ? 'bg-green-100' 
                        : stage.status === 'error' 
                          ? 'bg-red-100' 
                          : ''
                    }`}
                  />
                  {stage.message && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {stage.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {status.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errors</AlertTitle>
            <AlertDescription>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {status.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {status.warnings.length > 0 && (
          <Alert variant="warning">
            <Info className="h-4 w-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>
              <ul className="text-sm list-disc pl-5 space-y-1">
                {status.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

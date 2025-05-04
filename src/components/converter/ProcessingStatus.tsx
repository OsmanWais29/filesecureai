
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Info, AlertCircle, CheckCircle, Clock, Hourglass, FileCheck, FileScan } from "lucide-react";
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
        return <FileScan className="h-5 w-5 text-primary animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <Card className="shadow-sm mt-6 border-none bg-card/80 backdrop-blur-sm">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Hourglass className={`h-4 w-4 text-primary ${status.overallProgress < 100 ? 'animate-pulse' : ''}`} />
              </div>
              <h3 className="text-lg font-medium">Processing Progress</h3>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">
                {formatElapsedTime(status.startTime)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Progress 
              value={status.overallProgress} 
              className={`h-2 ${status.overallProgress === 100 ? "bg-green-100" : ""}`} 
            />
            
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{Math.round(status.overallProgress)}% Complete</span>
              {status.estimatedTimeRemaining && status.overallProgress < 100 && (
                <span className="text-muted-foreground">
                  Estimated time remaining: {formatTimeRemaining(status.estimatedTimeRemaining)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-base font-medium flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" /> 
            Processing Stages
          </h4>
          
          <div className="space-y-4 bg-background p-4 rounded-lg border">
            {status.stages.map((stage) => (
              <div key={stage.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  {getStageIcon(stage.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${stage.status === 'processing' ? "font-medium text-primary" : stage.status === 'complete' ? "font-medium text-green-500" : ""}`}>
                        {stage.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        stage.status === 'complete' 
                          ? 'bg-green-100 text-green-700' 
                          : stage.status === 'processing'
                            ? 'bg-primary/20 text-primary animate-pulse'
                            : stage.status === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-muted text-muted-foreground'
                      }`}>
                        {stage.status === 'processing' 
                          ? 'In progress' 
                          : stage.status === 'complete'
                            ? 'Complete'
                            : stage.status === 'pending'
                              ? 'Pending'
                              : 'Error'}
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
                      <p className="text-xs text-muted-foreground mt-1">
                        {stage.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {status.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errors Detected</AlertTitle>
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
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Warnings</AlertTitle>
            <AlertDescription className="text-amber-700">
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

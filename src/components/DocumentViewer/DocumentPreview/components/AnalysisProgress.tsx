
import { Progress } from "@/components/ui/progress";
import { FileDigit, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface AnalysisProgressProps {
  documentId?: string;  // Added documentId as an optional prop
  progress: number;
  analysisStep: string;
  processingStage?: string;
  onComplete?: () => void; // Made this optional to match usage
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  documentId,
  analysisStep,
  progress,
  processingStage,
  onComplete
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  
  // Track elapsed time for better user feedback
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate estimated time remaining based on progress
  useEffect(() => {
    if (progress > 5 && progress < 95) {
      const totalEstimatedSeconds = (elapsedSeconds / progress) * 100;
      const remaining = Math.max(Math.round(totalEstimatedSeconds - elapsedSeconds), 1);
      setEstimatedTimeRemaining(remaining);
    } else if (progress >= 95) {
      setEstimatedTimeRemaining(null);
      
      // Call onComplete when progress reaches 100%
      if (progress >= 100 && onComplete) {
        onComplete();
      }
    }
  }, [progress, elapsedSeconds, onComplete]);
  
  // Format the time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds} min`;
  };
  
  // Map processing stages to user-friendly descriptions
  const getStageDescription = (stage: string): string => {
    const stageDescriptions: Record<string, string> = {
      'document_ingestion': 'Reading document content',
      'document_classification': 'Identifying document type',
      'data_extraction': 'Extracting key information',
      'risk_assessment': 'Analyzing compliance risks',
      'issue_prioritization': 'Prioritizing identified issues',
      'document_organization': 'Organizing document data',
      'collaboration_setup': 'Setting up collaboration features',
      'continuous_learning': 'Finalizing analysis'
    };
    
    return stageDescriptions[stage] || 'Processing document';
  };

  return (
    <div className="bg-muted/30 border rounded-lg p-6 my-4 flex flex-col items-center">
      <div className="flex items-center justify-center mb-4">
        <div className="animate-pulse bg-primary/20 p-3 rounded-full">
          <FileDigit className="h-8 w-8 text-primary" />
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-center mb-2">
        Document Analysis in Progress
      </h3>
      
      <p className="text-sm text-muted-foreground text-center mb-4">
        {processingStage ? getStageDescription(processingStage) : analysisStep}
      </p>
      
      <div className="w-full max-w-md mb-3">
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex items-center justify-between w-full max-w-md px-1">
        <p className="text-xs text-muted-foreground">
          {progress}% complete
        </p>
        
        {estimatedTimeRemaining && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>~{formatTimeRemaining(estimatedTimeRemaining)} remaining</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-2 w-full max-w-md mt-4">
        {['document_ingestion', 'data_extraction', 'risk_assessment', 'continuous_learning'].map((stage, index) => (
          <div 
            key={stage}
            className={`text-center p-1 rounded-sm text-xs ${
              processingStage === stage || 
              (processingStage && ['document_organization', 'collaboration_setup'].includes(processingStage) && stage === 'continuous_learning') || 
              (index === 0 && progress > 0) || 
              (index === 1 && progress >= 30) || 
              (index === 2 && progress >= 60) || 
              (index === 3 && progress >= 90)
                ? 'bg-primary/10 text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            {index === 0 ? 'Extraction' : 
             index === 1 ? 'Processing' : 
             index === 2 ? 'Analysis' : 'Finishing'}
          </div>
        ))}
      </div>
    </div>
  );
};

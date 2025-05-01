
import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { monitorAnalysisProgress } from "@/utils/documents/api/analysisApi";
import { Skeleton } from "@/components/ui/skeleton";

interface AIAnalysisMonitorProps {
  documentId: string;
  onAnalysisComplete?: () => void;
}

export const AIAnalysisMonitor: React.FC<AIAnalysisMonitorProps> = ({ 
  documentId, 
  onAnalysisComplete 
}) => {
  const [status, setStatus] = useState<string>('pending');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!documentId) return;
    
    const checkProgress = async () => {
      try {
        const result = await monitorAnalysisProgress(documentId);
        
        setStatus(result.status);
        setProgress(result.progress);
        setError(result.error);
        setLastUpdate(result.lastUpdate);
        
        if (result.status === 'complete' && onAnalysisComplete) {
          onAnalysisComplete();
          toast({
            title: "Analysis Complete",
            description: "Document has been successfully analyzed",
          });
        } else if (result.status === 'failed' && result.error) {
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: result.error,
          });
        }
      } catch (error) {
        console.error("Error monitoring analysis:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Check immediately on mount
    checkProgress();
    
    // Then poll every 3 seconds, but only if not complete or failed
    const interval = setInterval(() => {
      if (status !== 'complete' && status !== 'failed') {
        checkProgress();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [documentId, status, onAnalysisComplete]);

  const getStatusIcon = () => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
      case 'processing_financial':
        return <Brain className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'complete': 
        return "Analysis Complete";
      case 'failed': 
        return "Analysis Failed";
      case 'processing': 
        return "Processing Document";
      case 'processing_financial': 
        return "Analyzing Financial Data";
      default:
        return "Waiting to Start";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          {getStatusIcon()}
          <span>AI Analysis: {getStatusText()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Processing {progress}% complete</span>
              {lastUpdate && (
                <span>Last update: {new Date(lastUpdate).toLocaleTimeString()}</span>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {error && (
            <div className="p-3 text-sm bg-red-50 border border-red-100 rounded text-red-700">
              {error}
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            {status === 'pending' && (
              <p>Analysis will begin shortly. Please wait...</p>
            )}
            {status === 'processing' && (
              <p>AI is extracting information from your document. This may take several moments depending on document size.</p>
            )}
            {status === 'processing_financial' && (
              <p>Analyzing financial data and performing risk assessment...</p>
            )}
            {status === 'complete' && (
              <p>Document successfully analyzed. View the extracted information and risk assessment in the sidebar.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

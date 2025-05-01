
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, CheckCircle, RefreshCw, Loader2, Clock, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useDocumentAI } from '../hooks/useDocumentAI';
import { AIInfoPanel } from '../../AIInfoPanel';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentAIPanelProps {
  documentId: string;
  analysisData?: any;
  debugInfo?: any;
  onAnalysisComplete?: () => void;
}

export const DocumentAIPanel: React.FC<DocumentAIPanelProps> = ({
  documentId,
  analysisData,
  debugInfo,
  onAnalysisComplete
}) => {
  const { 
    processDocument, 
    isProcessing, 
    error, 
    progress, 
    analysisStatus,
    retryCount,
    checkDocumentStatus 
  } = useDocumentAI(documentId);

  const [processingTime, setProcessingTime] = useState(0);
  const [isStuck, setIsStuck] = useState(false);

  // Timer to track processing time
  useEffect(() => {
    let interval: number | null = null;
    
    if (isProcessing) {
      const startTime = Date.now();
      interval = window.setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        setProcessingTime(elapsedSeconds);
        
        // If processing takes more than 60 seconds, consider it potentially stuck
        if (elapsedSeconds > 60 && progress < 80) {
          setIsStuck(true);
        }
      }, 1000);
    } else {
      setProcessingTime(0);
      setIsStuck(false);
    }
    
    return () => {
      if (interval !== null) {
        clearInterval(interval);
      }
    };
  }, [isProcessing, progress]);

  // Check document status on mount
  useEffect(() => {
    const checkInitialStatus = async () => {
      const status = await checkDocumentStatus();
      if (status && status.ai_processing_status === 'processing') {
        // If document is already being processed, show the processing UI
        processDocument();
      }
    };
    
    checkInitialStatus();
  }, [documentId, checkDocumentStatus, processDocument]);

  const handleProcessDocument = async () => {
    const result = await processDocument();
    if (result && onAnalysisComplete) {
      onAnalysisComplete();
    }
  };

  // Format time string (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Document Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{analysisStatus}</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Processing time: {formatTime(processingTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>This may take up to a minute depending on document size</span>
              </div>
              
              {isStuck && (
                <Alert className="mt-2 bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-sm text-amber-700">
                    Analysis may be taking longer than expected. You can continue viewing the document or restart the analysis.
                  </AlertDescription>
                  <Button 
                    onClick={handleProcessDocument} 
                    variant="ghost" 
                    size="sm"
                    className="mt-2 text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Restart Analysis
                  </Button>
                </Alert>
              )}
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">Analysis Error</p>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={handleProcessDocument} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
            </div>
          ) : analysisData ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <p className="font-medium">Analysis Complete</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Document has been analyzed. View the extracted information and risk assessment in the sidebar.
              </p>
              <Button 
                onClick={handleProcessDocument} 
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Analysis Again
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                AI can analyze this document to extract key information, identify risks, and assess compliance.
              </p>
              <Button onClick={handleProcessDocument} className="w-full">
                <Brain className="h-4 w-4 mr-2" />
                Analyze Document with AI
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {analysisData && (
        <AIInfoPanel 
          analysisData={analysisData}
          debugInfo={debugInfo}
        />
      )}
    </div>
  );
};

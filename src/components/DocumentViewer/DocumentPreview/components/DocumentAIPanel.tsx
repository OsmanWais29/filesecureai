
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useDocumentAI } from '../hooks/useDocumentAI';
import { AIInfoPanel } from '../../AIInfoPanel';

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
  const { processDocument, isProcessing, error, progress, analysisStatus } = useDocumentAI(documentId);

  const handleProcessDocument = async () => {
    const result = await processDocument();
    if (result && onAnalysisComplete) {
      onAnalysisComplete();
    }
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
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>This may take up to a minute depending on document size</span>
              </div>
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

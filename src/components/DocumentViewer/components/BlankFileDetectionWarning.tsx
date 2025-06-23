
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileX, RefreshCw, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BlankFileAnalysisService, BlankFileAnalysis } from './BlankFileAnalysis/BlankFileAnalysisService';
import { BlankFileDetails } from './BlankFileAnalysis/BlankFileDetails';

interface BlankFileDetectionWarningProps {
  documentId: string;
  onReupload?: () => void;
}

export const BlankFileDetectionWarning = ({ documentId, onReupload }: BlankFileDetectionWarningProps) => {
  const [analysis, setAnalysis] = useState<BlankFileAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    analyzeBlankFile();
  }, [documentId]);

  const analyzeBlankFile = async () => {
    setIsAnalyzing(true);
    try {
      const result = await BlankFileAnalysisService.analyzeBlankFile(documentId);
      setAnalysis(result);
    } catch (error) {
      console.error('Blank file detection error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReanalyze = () => {
    analyzeBlankFile();
  };

  if (isAnalyzing) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Analyzing file content for blank or corrupted data...
        </AlertDescription>
      </Alert>
    );
  }

  if (!analysis || !analysis.isBlank) {
    return null; // Don't show warning if file appears to have content
  }

  return (
    <div className="space-y-3">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <strong>Blank or Corrupted File Detected</strong>
              <div className="mt-1 text-sm">
                This file appears to be blank or corrupted with {analysis.confidence}% confidence.
              </div>
            </div>
            <Badge variant="destructive" className="ml-2">
              {analysis.confidence}% Blank
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2"
        >
          <FileX className="h-4 w-4" />
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReanalyze}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Re-analyze
        </Button>
        
        {onReupload && (
          <Button 
            variant="default" 
            size="sm" 
            onClick={onReupload}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload New Version
          </Button>
        )}
      </div>

      {showDetails && <BlankFileDetails analysis={analysis} />}
    </div>
  );
};

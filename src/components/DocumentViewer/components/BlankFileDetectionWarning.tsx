
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, FileX, RefreshCw, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface BlankFileDetectionWarningProps {
  documentId: string;
  onReupload?: () => void;
}

interface BlankFileAnalysis {
  isBlank: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
  fileSize: number;
  pageCount?: number;
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
      // Get document details
      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !document) return;

      // Check file size first - very small files are likely blank
      const isSmallFile = document.size < 1024; // Less than 1KB
      
      // Call blank file detection edge function
      const { data: result, error: analysisError } = await supabase.functions.invoke('detect-blank-file', {
        body: {
          documentId,
          storagePath: document.storage_path,
          fileSize: document.size,
          fileType: document.type
        }
      });

      if (analysisError) {
        console.error('Blank file analysis failed:', analysisError);
        return;
      }

      const blankAnalysis: BlankFileAnalysis = {
        isBlank: result?.isBlank || isSmallFile,
        confidence: result?.confidence || (isSmallFile ? 95 : 0),
        issues: result?.issues || (isSmallFile ? ['File size extremely small'] : []),
        suggestions: result?.suggestions || [],
        fileSize: document.size,
        pageCount: result?.pageCount
      };

      setAnalysis(blankAnalysis);

    } catch (error) {
      console.error('Blank file detection error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReanalyze = () => {
    analyzeBlankFile();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

      {showDetails && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-3">File Analysis Details</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-sm font-medium">File Size:</span>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(analysis.fileSize)}
              </p>
            </div>
            
            {analysis.pageCount !== undefined && (
              <div>
                <span className="text-sm font-medium">Page Count:</span>
                <p className="text-sm text-muted-foreground">
                  {analysis.pageCount} pages
                </p>
              </div>
            )}
          </div>

          {analysis.issues.length > 0 && (
            <div className="mb-4">
              <span className="text-sm font-medium">Issues Detected:</span>
              <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                {analysis.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestions.length > 0 && (
            <div>
              <span className="text-sm font-medium">Suggestions:</span>
              <ul className="mt-1 text-sm text-muted-foreground list-disc list-inside">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

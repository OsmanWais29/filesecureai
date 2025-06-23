
import { Badge } from '@/components/ui/badge';
import { BlankFileAnalysis } from './BlankFileAnalysisService';

interface BlankFileDetailsProps {
  analysis: BlankFileAnalysis;
}

export const BlankFileDetails = ({ analysis }: BlankFileDetailsProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
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
  );
};

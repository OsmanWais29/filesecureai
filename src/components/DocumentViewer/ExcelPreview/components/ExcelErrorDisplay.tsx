
import React from 'react';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExcelErrorDisplayProps } from '../types';

const ExcelErrorDisplay: React.FC<ExcelErrorDisplayProps> = ({ 
  error, 
  onRefresh, 
  publicUrl 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-xl font-medium mb-2">Error Loading Spreadsheet</h3>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        {error || "Failed to load the spreadsheet. It may be corrupted or in an unsupported format."}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
        {publicUrl && (
          <Button variant="outline" onClick={() => window.open(publicUrl, '_blank')} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Original File
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExcelErrorDisplay;

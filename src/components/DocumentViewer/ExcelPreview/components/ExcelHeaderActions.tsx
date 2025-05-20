
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';
import { ExcelHeaderActionsProps } from '../types';

const ExcelHeaderActions: React.FC<ExcelHeaderActionsProps> = ({
  title,
  onRefresh,
  publicUrl
}) => {
  const handleDownload = () => {
    if (!publicUrl) return;
    
    const link = document.createElement('a');
    link.href = publicUrl;
    link.download = title || 'spreadsheet';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="font-medium truncate">
        {title || 'Spreadsheet Data'}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 px-2 flex gap-1 items-center"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        {publicUrl && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(publicUrl, '_blank')}
              className="h-8 px-2 flex gap-1 items-center"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 px-2 flex gap-1 items-center"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ExcelHeaderActions;

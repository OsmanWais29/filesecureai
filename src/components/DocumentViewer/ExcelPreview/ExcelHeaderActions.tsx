
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw, Download, ExternalLink } from 'lucide-react';

interface ExcelHeaderActionsProps {
  title?: string;
  onRefresh: () => void;
  publicUrl: string;
}

export const ExcelHeaderActions: React.FC<ExcelHeaderActionsProps> = ({
  title,
  onRefresh,
  publicUrl
}) => {
  const handleDownload = () => {
    if (publicUrl) {
      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = title || 'spreadsheet';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenInNewTab = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="font-medium">
        {title || 'Excel Document'}
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          <RefreshCcw className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleOpenInNewTab}>
          <ExternalLink className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Open</span>
        </Button>
      </div>
    </div>
  );
};

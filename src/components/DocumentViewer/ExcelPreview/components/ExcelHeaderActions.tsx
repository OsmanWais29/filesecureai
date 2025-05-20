
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, FileSpreadsheet } from "lucide-react";
import { ExcelHeaderActionsProps } from '../types';

const ExcelHeaderActions: React.FC<ExcelHeaderActionsProps> = ({ 
  title = "Excel Document", 
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

  return (
    <div className="flex items-center justify-between p-2 border-b">
      <div className="flex items-center">
        <FileSpreadsheet className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="font-medium text-sm">{title}</h3>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onRefresh} 
          variant="ghost" 
          size="sm"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        {publicUrl && (
          <Button 
            onClick={handleDownload} 
            variant="ghost" 
            size="sm"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExcelHeaderActions;

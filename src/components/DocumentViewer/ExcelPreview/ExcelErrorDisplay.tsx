
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ExcelErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onRefresh?: () => void;
  publicUrl?: string;
}

export const ExcelErrorDisplay: React.FC<ExcelErrorDisplayProps> = ({
  error,
  onRetry,
  onRefresh,
  publicUrl
}) => {
  const handleOnRetry = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      onRetry();
    }
  };

  const handleOpenOriginal = () => {
    if (publicUrl) {
      window.open(publicUrl, '_blank');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading spreadsheet</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="default" onClick={handleOnRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Loading
        </Button>
        
        {publicUrl && (
          <Button variant="outline" onClick={handleOpenOriginal}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Original File
          </Button>
        )}
      </div>
    </div>
  );
};

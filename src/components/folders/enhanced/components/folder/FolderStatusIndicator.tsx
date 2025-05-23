
import React from 'react';
import { FolderStructure } from '@/types/folders';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface FolderStatusIndicatorProps {
  folder: FolderStructure;
}

export const FolderStatusIndicator: React.FC<FolderStatusIndicatorProps> = ({ folder }) => {
  const status = folder.metadata?.status || 'normal';
  
  switch (status) {
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'processing':
      return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    case 'complete':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

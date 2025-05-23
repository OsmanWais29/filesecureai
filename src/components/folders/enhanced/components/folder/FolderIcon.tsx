
import React from 'react';
import { Folder, FolderOpen, FileText } from 'lucide-react';

interface FolderIconProps {
  isExpanded: boolean;
  type?: string;
}

export const FolderIcon: React.FC<FolderIconProps> = ({ isExpanded, type }) => {
  if (type === 'document') {
    return <FileText className="h-4 w-4 text-blue-500" />;
  }
  
  return isExpanded ? 
    <FolderOpen className="h-4 w-4 text-yellow-600" /> : 
    <Folder className="h-4 w-4 text-yellow-600" />;
};

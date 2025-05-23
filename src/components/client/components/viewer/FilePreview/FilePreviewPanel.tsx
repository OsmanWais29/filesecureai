
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File, FileText, Image, Sheet } from 'lucide-react';

interface FilePreviewProps {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ 
  fileName, 
  fileType, 
  fileSize 
}) => {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="h-8 w-8" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <Sheet className="h-8 w-8" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getFileIcon(fileType)}
          File Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="font-medium">{fileName}</p>
          <p className="text-sm text-muted-foreground">
            Type: {fileType}
          </p>
          <p className="text-sm text-muted-foreground">
            Size: {formatFileSize(fileSize)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

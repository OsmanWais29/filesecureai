
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { File, FileText, Image, Spreadsheet } from 'lucide-react';
import { Document } from '../../../types';

interface DocumentGridProps {
  documents: Document[];
  onDocumentSelect: (documentId: string) => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({ 
  documents, 
  onDocumentSelect 
}) => {
  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <Image className="h-6 w-6" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <Spreadsheet className="h-6 w-6" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <Card 
          key={document.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onDocumentSelect(document.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {getFileIcon(document.type || '')}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{document.title}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Eye } from 'lucide-react';
import { AutoCategoryButton } from '@/components/AutoCategorization/AutoCategoryButton';
import { AnalysisStatusBadge } from '@/components/AutoCategorization/AnalysisStatusBadge';

interface DocumentCardProps {
  document: {
    id: string;
    title: string;
    type?: string;
    size?: number;
    created_at: string;
    metadata?: any;
  };
  onView: (documentId: string) => void;
  onCategorySuccess?: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onCategorySuccess
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getFileTypeIcon = (type?: string) => {
    // You could extend this with more specific icons
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getFileTypeIcon(document.type)}
              <h3 
                className="font-medium truncate text-sm" 
                title={document.title}
                onClick={() => onView(document.id)}
              >
                {document.title}
              </h3>
            </div>
            <AnalysisStatusBadge documentId={document.id} compact />
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {new Date(document.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center justify-between">
              <span>{formatFileSize(document.size)}</span>
              {document.type && (
                <Badge variant="outline" className="text-xs">
                  {document.type.split('/')[1]?.toUpperCase() || 'DOC'}
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <button
              onClick={() => onView(document.id)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Eye className="h-3 w-3" />
              View
            </button>
            
            <AutoCategoryButton
              documentId={document.id}
              documentTitle={document.title}
              onSuccess={onCategorySuccess}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

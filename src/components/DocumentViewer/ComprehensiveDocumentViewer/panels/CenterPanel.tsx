
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize, 
  Download,
  FileText,
  Highlight,
  Edit3
} from 'lucide-react';
import { DocumentDetails } from '../../types';
import { DocumentPreview } from '../../DocumentPreview';

interface CenterPanelProps {
  document: DocumentDetails;
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedPage: number;
  onPageSelect: (page: number) => void;
  annotations: any[];
  onAddAnnotation: (annotation: any) => void;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
  document,
  searchQuery,
  onSearch,
  selectedPage,
  onPageSelect,
  annotations,
  onAddAnnotation
}) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isAnnotating, setIsAnnotating] = useState(false);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search document..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Annotation Tools */}
          <Button
            size="sm"
            variant={isAnnotating ? "default" : "outline"}
            onClick={() => setIsAnnotating(!isAnnotating)}
          >
            <Highlight className="h-4 w-4 mr-1" />
            Annotate
          </Button>
          
          <Button size="sm" variant="outline">
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </Button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border rounded">
            <Button size="sm" variant="ghost" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm font-mono">{zoomLevel}%</span>
            <Button size="sm" variant="ghost" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* View Controls */}
          <Button size="sm" variant="outline" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button size="sm" variant="outline">
            <Maximize className="h-4 w-4" />
          </Button>
          
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Features Banner */}
      <div className="bg-blue-50 dark:bg-blue-950 px-3 py-2 border-b">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <FileText className="h-4 w-4" />
            <span className="font-medium">AI Analysis:</span>
          </div>
          <span className="text-blue-700 dark:text-blue-300">
            3 missing fields detected • 1 BIA violation found • Risk assessment complete
          </span>
        </div>
      </div>

      {/* Document Display */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full flex">
          {/* Page Thumbnails */}
          <div className="w-16 border-r bg-muted/30 overflow-y-auto">
            <div className="p-2 space-y-2">
              {[1, 2, 3].map((page) => (
                <Card
                  key={page}
                  className={`p-2 cursor-pointer transition-colors ${
                    selectedPage === page ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => onPageSelect(page)}
                >
                  <div className="aspect-[3/4] bg-white border rounded text-xs flex items-center justify-center">
                    {page}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Document View */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
            <div 
              className="mx-auto bg-white shadow-lg"
              style={{
                transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease-in-out'
              }}
            >
              <DocumentPreview
                storagePath={document.storage_path || ''}
                documentId={document.id}
                title={document.title}
              />
              
              {/* AI Overlay Highlights */}
              {isAnnotating && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-20 left-20 w-32 h-6 bg-red-200 bg-opacity-50 border-2 border-red-400 rounded">
                    <div className="absolute -top-6 left-0 text-xs bg-red-500 text-white px-2 py-1 rounded">
                      Missing Field
                    </div>
                  </div>
                  <div className="absolute top-40 right-20 w-40 h-8 bg-yellow-200 bg-opacity-50 border-2 border-yellow-400 rounded">
                    <div className="absolute -top-6 right-0 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                      BIA Violation
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center justify-center p-2 border-t bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Page {selectedPage} of 3</span>
        </div>
      </div>
    </div>
  );
};

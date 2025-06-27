
import React, { useState } from 'react';
import { DocumentDetails } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Maximize, 
  Search,
  Menu,
  SidebarClose,
  SidebarOpen
} from 'lucide-react';
import DocumentPreview from '../../DocumentPreview';

interface CenterPanelProps {
  document: DocumentDetails;
  documentId: string;
  onToggleLeftPanel?: () => void;
  onToggleRightPanel?: () => void;
  showLeftPanel?: boolean;
  showRightPanel?: boolean;
}

export const CenterPanel: React.FC<CenterPanelProps> = ({
  document,
  documentId,
  onToggleLeftPanel,
  onToggleRightPanel,
  showLeftPanel = true,
  showRightPanel = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-background border-b">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          {onToggleLeftPanel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleLeftPanel}
            >
              {showLeftPanel ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
            </Button>
          )}
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-mono px-2 min-w-[60px] text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 300}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center Search */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document content, risks, comments..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Maximize className="h-4 w-4" />
          </Button>
          
          {onToggleRightPanel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleRightPanel}
            >
              {showRightPanel ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      {/* Document Title */}
      <div className="px-4 py-2 bg-background border-b">
        <h1 className="text-lg font-semibold truncate">{document.title}</h1>
        <p className="text-sm text-muted-foreground">
          {document.type} • Last modified {new Date(document.updated_at).toLocaleDateString()}
        </p>
      </div>

      {/* Document Preview */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          className="h-full w-full"
          style={{ 
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left'
          }}
        >
          <DocumentPreview
            storagePath={document.storage_path}
            documentId={documentId}
            title={document.title}
          />
        </div>

        {/* AI Highlights Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* This would contain AI-generated highlights and annotations */}
          {document.analysis?.map((analysis, index) => (
            <div key={index} className="absolute">
              {/* Risk highlights would be positioned here based on OCR coordinates */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

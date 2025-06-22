
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize, 
  Download, 
  Printer,
  RefreshCw 
} from 'lucide-react';

interface ViewerControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onFullscreen: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onRefresh: () => void;
  isFullscreen?: boolean;
}

export const ViewerControls = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onRotate,
  onFullscreen,
  onDownload,
  onPrint,
  onRefresh,
  isFullscreen = false
}: ViewerControlsProps) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          disabled={zoomLevel <= 25}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-mono min-w-[3rem] text-center">
          {zoomLevel}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          disabled={zoomLevel >= 300}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Document Controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRotate}
        title="Rotate"
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
      >
        <Maximize className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border" />

      {/* Action Controls */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        title="Refresh Document"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDownload}
        title="Download"
      >
        <Download className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onPrint}
        title="Print"
      >
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  );
};

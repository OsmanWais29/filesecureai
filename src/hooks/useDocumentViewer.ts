
import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useDocumentViewer = () => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 25, 300));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 25, 25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
      toast({
        variant: "destructive",
        title: "Fullscreen Error",
        description: "Could not toggle fullscreen mode"
      });
    }
  }, [isFullscreen, toast]);

  const handleDownload = useCallback(async (documentUrl: string, fileName: string) => {
    try {
      const response = await fetch(documentUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${fileName}`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not download the document"
      });
    }
  }, [toast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleRefresh = useCallback(() => {
    // Reset zoom and rotation
    setZoomLevel(100);
    setRotation(0);
    
    toast({
      title: "Document Refreshed",
      description: "View has been reset"
    });
  }, [toast]);

  // Listen for fullscreen changes
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(Boolean(document.fullscreenElement));
  }, []);

  return {
    zoomLevel,
    rotation,
    isFullscreen,
    containerRef,
    handleZoomIn,
    handleZoomOut,
    handleRotate,
    handleFullscreen,
    handleDownload,
    handlePrint,
    handleRefresh,
    handleFullscreenChange
  };
};

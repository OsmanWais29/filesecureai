
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DocumentPreview } from './DocumentPreview';
import { EnhancedComments } from './EnhancedComments';
import { DeadlineManager } from './DeadlineManager';
import { VersionToggle } from './components/VersionToggle';
import { ViewerControls } from './components/ViewerControls';
import { useDocumentViewer } from '@/hooks/useDocumentViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedDocumentViewerProps {
  documentId: string;
  documentTitle?: string;
}

export const EnhancedDocumentViewer: React.FC<EnhancedDocumentViewerProps> = ({
  documentId,
  documentTitle
}) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStoragePath, setCurrentStoragePath] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  
  const {
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
  } = useDocumentViewer();

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleFullscreenChange]);

  useEffect(() => {
    fetchDocument();
  }, [documentId, refreshKey]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) throw error;

      setDocument(data);
      setCurrentStoragePath(data.storage_path || '');
    } catch (error) {
      console.error('Error fetching document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load document"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (versionId: string, storagePath: string) => {
    setCurrentStoragePath(storagePath);
    setRefreshKey(prev => prev + 1);
  };

  const handleDocumentDownload = () => {
    if (currentStoragePath && document?.title) {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(currentStoragePath);
      
      if (data.publicUrl) {
        handleDownload(data.publicUrl, document.title);
      }
    }
  };

  const handleDocumentRefresh = () => {
    handleRefresh();
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Document Not Found</h3>
          <p className="text-muted-foreground">The requested document could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-full" ref={containerRef}>
      {/* Left Panel - Document Details */}
      <div className="col-span-3 space-y-4 overflow-y-auto max-h-full">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">Document Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-1">Title</h4>
              <p className="text-sm text-muted-foreground">{document.title}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-1">Type</h4>
              <Badge variant="secondary" className="text-xs">
                {document.type || 'Unknown'}
              </Badge>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-1">Size</h4>
              <p className="text-sm text-muted-foreground">
                {document.size ? `${(document.size / 1024).toFixed(1)} KB` : 'Unknown'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-1">Upload Date</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-1">Processing Status</h4>
              <Badge 
                variant={document.ai_processing_status === 'complete' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {document.ai_processing_status || 'pending'}
              </Badge>
            </div>

            {document.metadata && Object.keys(document.metadata).length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Metadata</h4>
                <div className="space-y-1">
                  {Object.entries(document.metadata as Record<string, any>).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="font-medium">{key}:</span>{' '}
                      <span className="text-muted-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deadlines Manager */}
        <DeadlineManager 
          document={document} 
          onDeadlineUpdated={fetchDocument}
        />
      </div>

      {/* Center Panel - Document Viewer */}
      <div className="col-span-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold truncate">
              {documentTitle || document.title}
            </h2>
            <VersionToggle 
              documentId={documentId}
              onVersionChange={handleVersionChange}
            />
          </div>
          
          <ViewerControls
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotate={handleRotate}
            onFullscreen={handleFullscreen}
            onDownload={handleDocumentDownload}
            onPrint={handlePrint}
            onRefresh={handleDocumentRefresh}
            isFullscreen={isFullscreen}
          />
        </div>

        <div 
          className="flex-1 border rounded-lg overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
            transformOrigin: 'center center'
          }}
        >
          <DocumentPreview
            key={refreshKey}
            storagePath={currentStoragePath}
            documentId={documentId}
            title={document.title}
          />
        </div>
      </div>

      {/* Right Panel - Comments and Activity */}
      <div className="col-span-3 space-y-4 overflow-y-auto max-h-full">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">Comments & Discussion</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <EnhancedComments documentId={documentId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

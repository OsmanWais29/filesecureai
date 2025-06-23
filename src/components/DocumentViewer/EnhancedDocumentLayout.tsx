
import React, { useState, useCallback } from 'react';
import { DocumentDetails } from './types';
import { InteractiveDocumentViewer } from './InteractiveDocumentViewer';
import { CollaborationToolbar } from './CollaborationToolbar';
import { SmartAnnotations } from './SmartAnnotations';
import { CollaborationPanel } from './CollaborationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Highlighter, Users, BarChart3 } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface EnhancedDocumentLayoutProps {
  document: DocumentDetails;
  documentId: string;
}

export const EnhancedDocumentLayout: React.FC<EnhancedDocumentLayoutProps> = ({
  document,
  documentId
}) => {
  const [selectedTab, setSelectedTab] = useState('comments');
  const [commentCount, setCommentCount] = useState(document.comments?.length || 0);

  // Mock document URL - in real implementation, this would come from storage
  const documentUrl = document.storage_path ? 
    `/api/documents/${documentId}/preview` : 
    undefined;

  const handleCommentAdded = useCallback(() => {
    setCommentCount(prev => prev + 1);
  }, []);

  const handleHighlightClick = useCallback((highlight: any) => {
    // Switch to annotations tab when a highlight is clicked
    setSelectedTab('annotations');
  }, []);

  const handleAnnotationAdd = useCallback((annotation: any) => {
    console.log('New annotation:', annotation);
    // Handle annotation addition logic here
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Collaboration Toolbar */}
      <CollaborationToolbar
        documentId={documentId}
        onStartCollaboration={() => console.log('Collaboration started')}
        onShareDocument={() => console.log('Document shared')}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Document Viewer Panel */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <InteractiveDocumentViewer
              document={document}
              documentUrl={documentUrl}
              onHighlightClick={handleHighlightClick}
              onAnnotationAdd={handleAnnotationAdd}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Collaboration Panel */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
            <div className="h-full border-l bg-card">
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
                <div className="border-b px-1">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="comments" className="flex items-center gap-1 text-xs">
                      <MessageSquare className="h-3 w-3" />
                      Comments
                      {commentCount > 0 && (
                        <span className="ml-1 bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                          {commentCount}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="annotations" className="flex items-center gap-1 text-xs">
                      <Highlighter className="h-3 w-3" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="flex items-center gap-1 text-xs">
                      <BarChart3 className="h-3 w-3" />
                      Activity
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="comments" className="h-full mt-0">
                    <CollaborationPanel 
                      document={document}
                      onCommentAdded={handleCommentAdded}
                    />
                  </TabsContent>

                  <TabsContent value="annotations" className="h-full mt-0">
                    <SmartAnnotations
                      documentId={documentId}
                      onAnnotationAdd={handleAnnotationAdd}
                      onAnnotationResolve={(id) => console.log('Resolved:', id)}
                    />
                  </TabsContent>

                  <TabsContent value="activity" className="h-full mt-0">
                    <div className="p-4 h-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Activity tracking</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Coming soon
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

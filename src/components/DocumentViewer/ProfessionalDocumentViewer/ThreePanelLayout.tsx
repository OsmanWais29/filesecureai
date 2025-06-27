
import React, { useState } from 'react';
import { DocumentDetails } from '../types';
import { LeftPanel } from './panels/LeftPanel';
import { CenterPanel } from './panels/CenterPanel';
import { RightPanel } from './panels/RightPanel';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ThreePanelLayoutProps {
  document: DocumentDetails;
  documentId: string;
}

export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  document,
  documentId
}) => {
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const isMobile = useIsMobile();

  // On mobile, show panels in overlay mode
  if (isMobile) {
    return (
      <div className="h-full flex flex-col relative">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-2 border-b bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
          >
            <ChevronLeft className="h-4 w-4" />
            Collaborate
          </Button>
          <h1 className="text-sm font-medium truncate px-2">{document.title}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRightPanel(!showRightPanel)}
          >
            Risks
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 relative">
          <CenterPanel document={document} documentId={documentId} />
          
          {/* Mobile Overlays */}
          {showLeftPanel && (
            <div className="absolute inset-y-0 left-0 w-80 bg-background border-r z-10 overflow-hidden">
              <LeftPanel 
                document={document} 
                onClose={() => setShowLeftPanel(false)}
              />
            </div>
          )}
          
          {showRightPanel && (
            <div className="absolute inset-y-0 right-0 w-80 bg-background border-l z-10 overflow-hidden">
              <RightPanel 
                document={document} 
                onClose={() => setShowRightPanel(false)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-full flex">
      {/* Left Panel */}
      {showLeftPanel && (
        <div className="w-80 flex-shrink-0 border-r bg-background">
          <LeftPanel document={document} />
        </div>
      )}

      {/* Center Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <CenterPanel 
          document={document} 
          documentId={documentId}
          onToggleLeftPanel={() => setShowLeftPanel(!showLeftPanel)}
          onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
          showLeftPanel={showLeftPanel}
          showRightPanel={showRightPanel}
        />
      </div>

      {/* Right Panel */}
      {showRightPanel && (
        <div className="w-96 flex-shrink-0 border-l bg-background">
          <RightPanel document={document} />
        </div>
      )}
    </div>
  );
};

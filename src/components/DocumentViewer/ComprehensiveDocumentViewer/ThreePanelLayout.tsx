
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { LeftPanel } from './panels/LeftPanel';
import { CenterPanel } from './panels/CenterPanel';
import { RightPanel } from './panels/RightPanel';
import { DocumentDetails } from '../types';

interface ThreePanelLayoutProps {
  document: DocumentDetails;
  searchQuery: string;
  onSearch: (query: string) => void;
  selectedPage: number;
  onPageSelect: (page: number) => void;
  annotations: any[];
  onAddAnnotation: (annotation: any) => void;
}

export const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  document,
  searchQuery,
  onSearch,
  selectedPage,
  onPageSelect,
  annotations,
  onAddAnnotation
}) => {
  const [leftPanelSize, setLeftPanelSize] = useState(25);
  const [rightPanelSize, setRightPanelSize] = useState(25);

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left Panel - Collaboration & Document Info */}
      <ResizablePanel 
        defaultSize={leftPanelSize} 
        minSize={20} 
        maxSize={40}
        className="border-r border-border"
      >
        <LeftPanel 
          document={document}
          onCommentAdded={() => console.log('Comment added')}
          onTaskAssigned={() => console.log('Task assigned')}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Center Panel - Main Document Viewer */}
      <ResizablePanel 
        defaultSize={50} 
        minSize={30}
        className="flex flex-col"
      >
        <CenterPanel
          document={document}
          searchQuery={searchQuery}
          onSearch={onSearch}
          selectedPage={selectedPage}
          onPageSelect={onPageSelect}
          annotations={annotations}
          onAddAnnotation={onAddAnnotation}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Panel - Risk Assessment & Compliance */}
      <ResizablePanel 
        defaultSize={rightPanelSize} 
        minSize={20} 
        maxSize={40}
        className="border-l border-border"
      >
        <RightPanel 
          document={document}
          onRiskResolved={() => console.log('Risk resolved')}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

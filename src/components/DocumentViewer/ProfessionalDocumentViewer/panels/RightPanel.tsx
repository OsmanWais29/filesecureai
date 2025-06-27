
import React from 'react';
import { DocumentDetails } from '../../types';
import { RiskAssessment } from '../../RiskAssessment';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield } from 'lucide-react';

interface RightPanelProps {
  document: DocumentDetails;
  onClose?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
  document, 
  onClose 
}) => {
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Risk Assessment</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered compliance analysis
        </p>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <RiskAssessment 
            documentId={document.id}
            risks={document.risks || []}
            isLoading={false}
          />
        </div>
      </ScrollArea>
    </div>
  );
};


import React from 'react';
import { DocumentDetails } from '../../types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, Shield } from 'lucide-react';
import { RiskAssessment } from '../../RiskAssessment';

interface RightPanelProps {
  document: DocumentDetails;
  onClose?: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ document, onClose }) => {
  // Extract risks from document analysis
  const risks = document.analysis?.[0]?.content?.risks || [];
  const isLoading = document.ai_processing_status === 'processing' || document.ai_processing_status === 'pending';

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Risk Assessment</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            <RiskAssessment 
              risks={risks}
              documentId={document.id}
              isLoading={isLoading}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { DocumentDetails } from '../../types';
import { Button } from '@/components/ui/button';
import { Brain, X } from 'lucide-react';
import { TrusteeCoPliot } from './TrusteeCoPliot';
import { CollaborationTabs } from './CollaborationTabs';

interface LeftPanelProps {
  document: DocumentDetails;
  onClose?: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ document, onClose }) => {
  const [showTrusteeCoPilot, setShowTrusteeCoPilot] = useState(false);

  const handleTrusteeCoPilotClose = () => {
    setShowTrusteeCoPilot(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Toggle */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {showTrusteeCoPilot ? 'Trustee Co-Pilot™' : 'Collaboration'}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant={showTrusteeCoPilot ? "default" : "outline"}
              size="sm"
              onClick={() => setShowTrusteeCoPilot(!showTrusteeCoPilot)}
              className="text-xs"
            >
              <Brain className="h-3 w-3 mr-1" />
              Trustee Co-Pilot
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {showTrusteeCoPilot ? (
          <div className="h-full p-4">
            <TrusteeCoPliot onClose={handleTrusteeCoPilotClose} />
          </div>
        ) : (
          <CollaborationTabs document={document} />
        )}
      </div>
    </div>
  );
};

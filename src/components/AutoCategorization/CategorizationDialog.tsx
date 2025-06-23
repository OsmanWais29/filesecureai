
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertTriangle, FolderOpen, FileText } from 'lucide-react';

interface CategorizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: {
    suggestedClientFolder: string;
    suggestedFormCategory: string;
    confidenceLevel: 'high' | 'medium' | 'low';
    reasoning: string;
  } | null;
  onApprove: () => void;
  onReject: () => void;
  isApplying: boolean;
}

const confidenceConfig = {
  high: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'High Confidence' },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle, label: 'Medium Confidence' },
  low: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Low Confidence' }
};

export const CategorizationDialog: React.FC<CategorizationDialogProps> = ({
  isOpen,
  onClose,
  suggestion,
  onApprove,
  onReject,
  isApplying
}) => {
  if (!suggestion) return null;

  const config = confidenceConfig[suggestion.confidenceLevel];
  const ConfidenceIcon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Auto-Categorization Suggestion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Confidence Level */}
          <div className="flex items-center gap-2">
            <ConfidenceIcon className="h-4 w-4" />
            <Badge className={config.color}>
              {config.label}
            </Badge>
          </div>

          {/* Suggested Organization */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FolderOpen className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Suggested Organization:</span>
              </div>
              
              <div className="ml-6 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{suggestion.suggestedClientFolder}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{suggestion.suggestedFormCategory}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Reasoning:</span> {suggestion.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onReject}
              disabled={isApplying}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
              disabled={isApplying}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isApplying ? 'Applying...' : 'Accept & Organize'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            The document will be moved to the suggested folder structure automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

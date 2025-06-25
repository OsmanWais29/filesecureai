
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, RefreshCw, Send } from "lucide-react";

interface TrainingButtonsProps {
  onConfirmTrain: () => void;
  onReject: () => void;
  onReprocess: () => void;
  onSendToSAFA: () => void;
  disabled: boolean;
}

export const TrainingButtons: React.FC<TrainingButtonsProps> = ({
  onConfirmTrain,
  onReject,
  onReprocess,
  onSendToSAFA,
  disabled
}) => {
  return (
    <Card className="border-t border-l-0 border-r-0 border-b-0 rounded-none">
      <div className="p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={onConfirmTrain}
            disabled={disabled}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            Confirm & Train LLM
          </Button>
          
          <Button
            variant="destructive"
            onClick={onReject}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject & Ignore
          </Button>
          
          <Button
            variant="outline"
            onClick={onReprocess}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reprocess Document
          </Button>
          
          <Button
            variant="secondary"
            onClick={onSendToSAFA}
            disabled={disabled}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send to SAFA / CRM
          </Button>
        </div>
        
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Confirming field mappings improves the private LLM via feedback loop
          </p>
        </div>
      </div>
    </Card>
  );
};

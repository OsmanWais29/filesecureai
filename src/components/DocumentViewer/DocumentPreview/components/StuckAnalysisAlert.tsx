
import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabase';
import { sfaiFunctions } from "@/lib/sfaiFunctions";
interface StuckAnalysisAlertProps {
  documentId: string;
  minutesStuck: number;
  onRetryComplete: () => void;
}

export const StuckAnalysisAlert: React.FC<StuckAnalysisAlertProps> = ({
  documentId,
  minutesStuck,
  onRetryComplete
}) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    toast.info("Restarting document analysis...");
    
    try {
      // Update document status back to pending
      await supabase
        .from('documents')
        .update({
          ai_processing_status: 'pending',
          metadata: {
            processing_retry: true,
            processing_retry_timestamp: new Date().toISOString(),
            previous_retry_minutes_stuck: minutesStuck
          }
        })
        .eq('id', documentId);
        
      // Trigger document analysis again
      const { error } = await sfaiFunctions.invoke('analyze-document', {
        body: { documentId }
      });
      
      if (error) {
        console.error("Error restarting analysis:", error);
        toast.error("Failed to restart analysis");
      } else {
        toast.success("Analysis restarted successfully");
        onRetryComplete();
      }
    } catch (error) {
      console.error("Error retrying analysis:", error);
      toast.error("Failed to restart analysis process");
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-medium text-sm">Analysis seems stuck</h4>
        <p className="text-sm text-yellow-700 mt-1">
          Document analysis has been running for {minutesStuck} minutes without completing.
          This may indicate a processing issue.
        </p>
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-white"
            onClick={handleRetry}
            disabled={retrying}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            {retrying ? 'Restarting...' : 'Restart Analysis'}
          </Button>
        </div>
      </div>
    </div>
  );
};

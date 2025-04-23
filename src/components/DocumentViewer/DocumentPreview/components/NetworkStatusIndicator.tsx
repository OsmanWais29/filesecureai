
import React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface NetworkStatusIndicatorProps {
  isOnline: boolean;
  onRetry: () => void;
  attemptCount?: number;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  isOnline,
  onRetry,
  attemptCount = 0
}) => {
  const handleRetry = () => {
    toast.info("Retrying connection...");
    onRetry();
  };
  
  if (isOnline && attemptCount === 0) return null;
  
  return (
    <div className={`fixed bottom-4 right-4 flex items-center p-3 ${isOnline ? 'bg-amber-500/80' : 'bg-destructive/80'} text-destructive-foreground rounded-md shadow-lg z-50 ${isOnline ? '' : 'animate-pulse'}`}>
      {isOnline ? (
        <Wifi className="h-4 w-4 mr-2" />
      ) : (
        <WifiOff className="h-4 w-4 mr-2" />
      )}
      <span className="text-sm font-medium mr-2">
        {isOnline 
          ? "Connection limited. Document may load partially." 
          : "Offline. Document preview paused."}
      </span>
      <Button 
        variant="secondary" 
        size="sm" 
        className="ml-2" 
        onClick={handleRetry}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  );
};

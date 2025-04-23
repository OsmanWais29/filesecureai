
import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  // Only show if we're offline
  if (isOnline) return null;

  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 p-2 rounded-lg flex items-center justify-between">
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="h-4 w-4 mr-2" />
        ) : (
          <WifiOff className="h-4 w-4 mr-2" />
        )}
        <span className="text-sm">
          {isOnline
            ? "Connected"
            : "Network connection issue. Document may not display correctly."}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="ml-2 text-xs"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry{attemptCount > 0 ? ` (${attemptCount})` : ''}
      </Button>
    </div>
  );
};

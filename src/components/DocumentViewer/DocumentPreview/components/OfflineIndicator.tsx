
import React from 'react';
import { AlertCircle, CheckCircle, Download, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OfflineIndicatorProps {
  isOffline: boolean;
  isCached: boolean;
  isCaching: boolean;
  onCacheDocument: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOffline,
  isCached,
  isCaching,
  onCacheDocument
}) => {
  // If online and already cached
  if (!isOffline && isCached) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Available offline</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>This document is cached and will be available if you go offline</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If online and not cached
  if (!isOffline && !isCached) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={onCacheDocument}
              disabled={isCaching}
            >
              <Download className="h-3 w-3 mr-1" />
              {isCaching ? 'Caching...' : 'Save for offline'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save this document for offline viewing</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // If offline and cached
  if (isOffline && isCached) {
    return (
      <div className="flex items-center px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-md">
        <WifiOff className="h-3 w-3 mr-1" />
        <span>Offline mode</span>
      </div>
    );
  }

  // If offline and not cached
  return (
    <div className="flex items-center px-2 py-1 text-xs bg-red-50 text-red-700 rounded-md">
      <AlertCircle className="h-3 w-3 mr-1" />
      <span>Offline - Document not available</span>
    </div>
  );
};

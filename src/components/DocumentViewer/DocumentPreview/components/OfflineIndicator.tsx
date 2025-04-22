
import React from 'react';
import { AlertCircle, CheckCircle, Download, Wifi, WifiOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OfflineIndicatorProps {
  isOffline: boolean;
  isCached: boolean;
  isCaching: boolean;
  onCacheDocument: () => void;
  debugInfo?: {
    url?: string | null;
    retries?: number;
    lastError?: string | null;
  };
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOffline,
  isCached,
  isCaching,
  onCacheDocument,
  debugInfo
}) => {
  // Generate debug info for tooltips
  const getDebugInfoText = () => {
    if (!debugInfo) return '';
    
    return [
      debugInfo.url ? `URL: ${debugInfo.url.substring(0, 40)}...` : '',
      debugInfo.retries ? `Retries: ${debugInfo.retries}` : '',
      debugInfo.lastError ? `Error: ${debugInfo.lastError}` : ''
    ].filter(Boolean).join('\n');
  };
  
  // Show debug icon if debug info is available
  const renderDebugIcon = () => {
    if (!debugInfo) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="ml-1.5 cursor-help">
              <Info className="h-3 w-3 text-amber-500" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <pre className="text-xs whitespace-pre-wrap">{getDebugInfoText()}</pre>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // If online and already cached
  if (!isOffline && isCached) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center px-2 py-1 text-xs bg-green-50 text-green-700 rounded-md">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span>Available offline</span>
              {renderDebugIcon()}
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
              {renderDebugIcon()}
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
        {renderDebugIcon()}
      </div>
    );
  }

  // If offline and not cached
  return (
    <div className="flex items-center px-2 py-1 text-xs bg-red-50 text-red-700 rounded-md">
      <AlertCircle className="h-3 w-3 mr-1" />
      <span>Offline - Document not available</span>
      {renderDebugIcon()}
    </div>
  );
};

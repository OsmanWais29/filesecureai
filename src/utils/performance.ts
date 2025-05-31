
import { toast } from "sonner";
import { startTiming, endTiming } from "./performanceMonitor";
import { analyticsService } from "@/services/analyticsService";

// Debounce function to prevent excessive toasts
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

// Cache for performance toasts to prevent showing duplicates
const shownPerformanceToasts = new Set<string>();

/**
 * Shows a performance toast for a specific page or operation
 */
export const showPerformanceToast = debounce((pageName: string) => {
  // Check if we've already shown a toast for this page in this session
  const toastKey = `${pageName}-${Date.now()}`;
  if (shownPerformanceToasts.has(pageName)) {
    return;
  }
  
  // End timing for page load
  const loadTime = endTiming(`page-load-${pageName}`);
  
  // Track the performance metric
  if (loadTime) {
    analyticsService.trackEvent({
      category: 'Performance',
      type: 'PageLoad',
      metadata: {
        pageName,
        value: Math.round(loadTime)
      }
    });
    
    // Show toast for slow page loads (> 500ms) in development only
    if (loadTime > 500 && process.env.NODE_ENV !== 'production') {
      toast.info(
        `${pageName} loaded in ${(loadTime / 1000).toFixed(1)}s`, 
        { duration: 3000, position: 'bottom-right' }
      );
      
      // Add to shown toasts
      shownPerformanceToasts.add(pageName);
      
      // Clear from set after a while to allow showing again later
      setTimeout(() => shownPerformanceToasts.delete(pageName), 60000);
    }
  }
  
  // Start timing for page interactions
  startTiming(`page-interact-${pageName}`);
}, 100);

// Export functions from the performanceMonitor module
export { 
  measureRouteChange,
  initPerformanceMonitoring,
  startTiming,
  endTiming,
  getPerformanceMeasurements,
  getAnomalyThresholds,
  getPerformanceHistory,
  resetPerformanceHistory
} from './performanceMonitor';

// Create and export additional measurement utility functions
export const measureDocumentLoad = (documentId: string) => {
  startTiming(`document-load-${documentId}`);
  return () => endTiming(`document-load-${documentId}`);
};

export const measureApiCall = (endpoint: string) => {
  startTiming(`api-${endpoint}`);
  return () => endTiming(`api-${endpoint}`);
};

export const measureComponentRender = (componentName: string) => {
  startTiming(`render-${componentName}`);
  return () => endTiming(`render-${componentName}`);
};

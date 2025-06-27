/**
 * Performance monitoring utilities
 */

const performanceMarks = new Map<string, number>();
const performanceMeasurements = new Map<string, number[]>();
const anomalyThresholds = new Map<string, { mean: number; stdDev: number }>();
const performanceHistory: Array<{ timestamp: number; measurements: Record<string, number> }> = [];

export const startTiming = (label: string): void => {
  performanceMarks.set(label, Date.now());
};

export const endTiming = (label: string): number => {
  const startTime = performanceMarks.get(label);
  if (!startTime) {
    console.warn(`No start time found for ${label}`);
    return 0;
  }
  
  const duration = Date.now() - startTime;
  performanceMarks.delete(label);
  
  // Store measurement for analysis
  const measurements = performanceMeasurements.get(label) || [];
  measurements.push(duration);
  performanceMeasurements.set(label, measurements);
  
  // Update anomaly thresholds
  updateAnomalyThresholds(label, measurements);
  
  if (duration > 100) {
    console.warn(`Slow operation detected: ${label} took ${duration}ms`);
  }
  
  return duration;
};

const updateAnomalyThresholds = (label: string, measurements: number[]): void => {
  if (measurements.length < 3) return;
  
  const mean = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
  const variance = measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / measurements.length;
  const stdDev = Math.sqrt(variance);
  
  anomalyThresholds.set(label, { mean, stdDev });
};

export const getPerformanceMeasurements = (): Record<string, number> => {
  const currentMeasurements: Record<string, number> = {};
  
  for (const [key, measurements] of performanceMeasurements.entries()) {
    if (measurements.length > 0) {
      currentMeasurements[key] = measurements[measurements.length - 1];
    }
  }
  
  return currentMeasurements;
};

export const getAnomalyThresholds = (): Record<string, { mean: number; stdDev: number }> => {
  const thresholds: Record<string, { mean: number; stdDev: number }> = {};
  
  for (const [key, value] of anomalyThresholds.entries()) {
    thresholds[key] = value;
  }
  
  return thresholds;
};

export const getPerformanceHistory = (): Array<{ timestamp: number; measurements: Record<string, number> }> => {
  return [...performanceHistory];
};

export const resetPerformanceHistory = (): void => {
  performanceHistory.length = 0;
  performanceMeasurements.clear();
  anomalyThresholds.clear();
};

export const measureRouteChange = (routeName: string): void => {
  startTiming(`route-change-${routeName}`);
};

export const initPerformanceMonitoring = (): void => {
  // Set up performance observer if available
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const measurements: Record<string, number> = {
            'dom-content-loaded': entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            'load-complete': entry.loadEventEnd - entry.loadEventStart,
            'first-paint': entry.responseEnd - entry.requestStart
          };
          
          performanceHistory.push({
            timestamp: Date.now(),
            measurements
          });
        }
      }
    });
    
    try {
      observer.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }
  }
  
  // Store measurements periodically
  setInterval(() => {
    const currentMeasurements = getPerformanceMeasurements();
    if (Object.keys(currentMeasurements).length > 0) {
      performanceHistory.push({
        timestamp: Date.now(),
        measurements: currentMeasurements
      });
      
      // Keep only last 100 entries
      if (performanceHistory.length > 100) {
        performanceHistory.splice(0, performanceHistory.length - 100);
      }
    }
  }, 30000); // Every 30 seconds
};

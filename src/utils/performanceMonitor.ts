
/**
 * Performance monitoring utilities
 */

const performanceMarks = new Map<string, number>();

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
  
  if (duration > 100) {
    console.warn(`Slow operation detected: ${label} took ${duration}ms`);
  }
  
  return duration;
};


/**
 * Debug utilities for development and troubleshooting
 */

// Flag to enable/disable debug mode
let debugModeEnabled = false;

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
  return debugModeEnabled || (typeof window !== 'undefined' && window.location.search.includes('debug=true'));
};

/**
 * Enable debug mode
 */
export const enableDebugMode = (): void => {
  debugModeEnabled = true;
  console.log("Debug mode enabled");
};

/**
 * Disable debug mode
 */
export const disableDebugMode = (): void => {
  debugModeEnabled = false;
  console.log("Debug mode disabled");
};

/**
 * Log document-related events when in debug mode
 */
export const logDocumentEvent = (message: string, data?: any): void => {
  if (isDebugMode()) {
    console.log(`[Document] ${message}`, data || '');
  }
};

/**
 * Debug timing utility
 */
export const debugTiming = (label: string, timeMs: number): void => {
  if (isDebugMode()) {
    console.log(`[Timing] ${label}: ${timeMs.toFixed(2)}ms`);
  }
};

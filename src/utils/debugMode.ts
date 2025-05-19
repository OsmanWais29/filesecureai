
// Utility functions for debug logging

/**
 * Initialize debug mode settings
 * Should be called early in the app lifecycle
 */
export const initDebugMode = (): void => {
  if (typeof window !== 'undefined') {
    const storedDebugMode = window.localStorage.getItem('securefiles_debug_mode');
    
    // Enable debug console messages if in debug mode
    if (storedDebugMode === 'true') {
      console.info('🐞 Debug mode enabled');
    }
    
    // Initialize debug timestamp for session tracking
    window.localStorage.setItem('securefiles_debug_timestamp', Date.now().toString());
  }
};

/**
 * Log authentication-related events
 * @param message The message to log
 */
export const logAuthEvent = (message: string, data?: any): void => {
  console.info(`🔑 Auth: ${message}`, data ? data : '');
};

/**
 * Record a session event for tracking and debugging
 * @param eventName The name of the event to record
 */
export const recordSessionEvent = (eventName: string): void => {
  console.info(`📝 Session Event: ${eventName}`);
};

/**
 * Log errors with consistent formatting and optional context
 * @param error The error object or message
 * @param context Optional context where the error occurred
 */
export const logError = (error: unknown, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const contextPrefix = context ? `[${context}] ` : '';
  
  console.error(`❌ ${contextPrefix}Error: ${errorMessage}`);
  
  if (errorStack && isDebugMode()) {
    console.error(`Stack trace:`, errorStack);
  }
  
  // Record error event for analytics/monitoring
  recordSessionEvent(`error_occurred${context ? `_${context}` : ''}`);
};

/**
 * Toggle debug mode on/off
 * @param enable Whether to enable debug mode
 */
export const setDebugMode = (enable: boolean): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('securefiles_debug_mode', enable ? 'true' : 'false');
    console.info(`🐞 Debug mode ${enable ? 'enabled' : 'disabled'}`);
  }
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem('securefiles_debug_mode') === 'true';
  }
  return false;
};

/**
 * Log routing-related events for debugging navigation issues
 * @param message The routing message to log
 * @param data Optional data related to the routing event
 */
export const logRoutingEvent = (message: string, data?: any): void => {
  console.info(`🧭 Routing: ${message}`, data ? data : '');
};

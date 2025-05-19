
// Utility functions for debug logging

/**
 * Log authentication-related events
 * @param message The message to log
 */
export const logAuthEvent = (message: string): void => {
  console.info(`🔑 Auth: ${message}`);
};

/**
 * Record a session event for tracking and debugging
 * @param eventName The name of the event to record
 */
export const recordSessionEvent = (eventName: string): void => {
  console.info(`📝 Session Event: ${eventName}`);
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

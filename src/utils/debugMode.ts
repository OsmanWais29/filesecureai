
/**
 * Debug mode utilities for tracking and resolving routing and authentication issues
 */

// Debug mode flag - can be toggled by URL parameter or localStorage
let _debugMode = false;

// Initialize debug mode from URL or localStorage
export function initDebugMode(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug');
  const localStorageDebug = localStorage.getItem('debug_mode');
  
  // Set debug mode if URL param is present or localStorage is set
  if (debugParam === 'true' || localStorageDebug === 'true') {
    _debugMode = true;
    console.log('🛠️ Debug mode enabled');
  }
}

// Call init at import time
initDebugMode();

// Check if debug mode is enabled
export function isDebugMode(): boolean {
  return _debugMode;
}

// Enable debug mode
export function enableDebugMode(): void {
  _debugMode = true;
  localStorage.setItem('debug_mode', 'true');
  console.log('🛠️ Debug mode enabled');
}

// Disable debug mode
export function disableDebugMode(): void {
  _debugMode = false;
  localStorage.removeItem('debug_mode');
  console.log('Debug mode disabled');
}

// Debug timing utility
export function debugTiming(label: string, timeMs: number): void {
  if (_debugMode) {
    console.log(`🕒 ${label}: ${timeMs.toFixed(2)}ms`);
  }
}

// Log auth events in debug mode
export function logAuthEvent(event: string, data?: any): void {
  if (_debugMode) {
    console.log(`🔐 Auth Event: ${event}`, data || '');
  }
}

// Log routing events in debug mode
export function logRoutingEvent(event: string, data?: any): void {
  if (_debugMode) {
    console.log(`🧭 Routing Event: ${event}`, data || '');
  }
}

// Track user session events
export const sessionEvents: Record<string, number> = {};

// Record a session event with timestamp
export function recordSessionEvent(event: string): void {
  const timestamp = Date.now();
  sessionEvents[event] = timestamp;
  
  if (_debugMode) {
    console.log(`📝 Session Event: ${event} at ${new Date(timestamp).toISOString()}`);
  }
}

// Get session duration between events
export function getSessionEventDuration(startEvent: string, endEvent: string): number | null {
  if (!sessionEvents[startEvent] || !sessionEvents[endEvent]) {
    return null;
  }
  
  return sessionEvents[endEvent] - sessionEvents[startEvent];
}

// Export all events for debugging
export function exportSessionEvents(): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  Object.entries(sessionEvents).forEach(([event, timestamp]) => {
    formatted[event] = new Date(timestamp).toISOString();
  });
  
  return formatted;
}


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

// Log auth events in debug mode with enhanced formatting
export function logAuthEvent(event: string, data?: any): void {
  const timestamp = new Date().toISOString();
  if (_debugMode) {
    console.log(`🔐 [${timestamp}] Auth Event: ${event}`, data || '');
  }
  
  // Add to in-memory log even if debug mode is off
  addToInMemoryLog('auth', `${event} ${data ? JSON.stringify(data) : ''}`);
}

// Log routing events in debug mode with enhanced formatting
export function logRoutingEvent(event: string, data?: any): void {
  const timestamp = new Date().toISOString();
  if (_debugMode) {
    console.log(`🧭 [${timestamp}] Routing Event: ${event}`, data || '');
  }
  
  // Add to in-memory log even if debug mode is off
  addToInMemoryLog('routing', `${event} ${data ? JSON.stringify(data) : ''}`);
}

// Enhanced session event tracking
const MAX_SESSION_EVENTS = 200; // Limit the number of events we store
export const sessionEvents: Record<string, number> = {};
let sessionEventOrder: string[] = []; // Track the order of events

// In-memory logs for detailed debugging
const inMemoryLogs: Record<string, string[]> = {
  auth: [],
  routing: [],
  errors: [],
  performance: []
};

// Add entry to in-memory log with category
function addToInMemoryLog(category: string, message: string): void {
  if (!inMemoryLogs[category]) {
    inMemoryLogs[category] = [];
  }
  
  // Add timestamp
  const timestamp = new Date().toISOString();
  inMemoryLogs[category].push(`[${timestamp}] ${message}`);
  
  // Limit the size
  if (inMemoryLogs[category].length > 100) {
    inMemoryLogs[category].shift();
  }
}

// Record a session event with timestamp
export function recordSessionEvent(event: string): void {
  const timestamp = Date.now();
  
  // Track order and timestamp
  sessionEvents[event] = timestamp;
  sessionEventOrder.push(event);
  
  // Limit the size
  while (sessionEventOrder.length > MAX_SESSION_EVENTS) {
    const oldestEvent = sessionEventOrder.shift();
    if (oldestEvent) delete sessionEvents[oldestEvent];
  }
  
  if (_debugMode) {
    console.log(`📝 Session Event: ${event} at ${new Date(timestamp).toISOString()}`);
  }
}

// Log errors with extra context
export function logError(error: Error | string, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`❌ Error${context ? ` [${context}]` : ''}: ${errorMessage}`);
  
  addToInMemoryLog('errors', `${context || 'general'} - ${errorMessage}`);
  
  // Record as session event
  recordSessionEvent(`error_${context || 'unknown'}`);
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

// Export all in-memory logs
export function exportLogs(): Record<string, string[]> {
  return { ...inMemoryLogs };
}

// Export all debug data (timing, events, logs) as JSON for downloading
export function exportDebugData(): string {
  const data = {
    sessionEvents: exportSessionEvents(),
    sessionEventOrder,
    logs: exportLogs(),
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };
  
  return JSON.stringify(data, null, 2);
}

// Function to check network connection status
export function checkNetworkStatus(): { online: boolean, type?: string } {
  const online = navigator.onLine;
  // @ts-ignore - connection property exists but TypeScript doesn't recognize it
  const connectionType = navigator.connection?.type || 'unknown';
  
  return { online, type: connectionType };
}

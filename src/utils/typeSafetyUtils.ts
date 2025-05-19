
/**
 * Utility functions for safe type handling
 */

/**
 * Safely cast a value to string or return default if not a string
 */
export function safeString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
}

/**
 * Safely cast a value to number or return default if not a number
 */
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return value;
  }
  // Try to convert string to number
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
}

/**
 * Safely cast a value to boolean or return default if not a boolean
 */
export function safeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return defaultValue;
}

/**
 * Safely cast a value to an object or return empty object
 */
export function safeObjectCast(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

/**
 * Safely cast an array to a typed array using a mapper function
 */
export function safeArrayCast<T>(
  value: unknown, 
  mapper: (item: Record<string, unknown>) => T
): T[] {
  if (Array.isArray(value)) {
    try {
      return value.map(item => {
        if (item && typeof item === 'object') {
          return mapper(item as Record<string, unknown>);
        }
        throw new Error('Array item is not an object');
      });
    } catch (error) {
      console.error('Error casting array:', error);
      return [];
    }
  }
  return [];
}

/**
 * Create a debug logger function
 */
export function createLogger(component: string) {
  return (message: string, data?: any) => {
    console.log(`[${component}] ${message}`, data || '');
  };
}


/**
 * Type-safe utility functions for handling potentially unknown values
 */

/**
 * Safely casts an unknown object to a specific type
 */
export function safeObjectCast<T>(obj: unknown): T {
  return obj as T;
}

/**
 * Safely spreads an unknown object preserving type information
 */
export function toSafeSpreadObject(obj: unknown): Record<string, unknown> {
  if (typeof obj === 'object' && obj !== null) {
    return { ...obj as Record<string, unknown> };
  }
  return {};
}

/**
 * Safely spreads an unknown array preserving type information
 */
export function toSafeSpreadArray<T>(arr: unknown): T[] {
  if (Array.isArray(arr)) {
    return [...arr] as T[];
  }
  return [];
}

/**
 * Safely converts unknown to a Record<string, unknown>
 */
export function toRecord(obj: unknown): Record<string, unknown> {
  if (typeof obj === 'object' && obj !== null) {
    return obj as Record<string, unknown>;
  }
  return {};
}

/**
 * Safely converts unknown to string
 */
export function safeString(value: unknown, defaultValue: string | null = ''): string | null {
  if (typeof value === 'string') {
    return value;
  } else if (value !== null && value !== undefined) {
    return String(value);
  }
  return defaultValue;
}

/**
 * Safely converts a value to a boolean
 */
export function safeBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return defaultValue;
}

/**
 * Safely converts a value to a number
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

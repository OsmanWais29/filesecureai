
/**
 * Utility functions for safe type handling
 */

/**
 * Safely cast an unknown object to a specific type
 * @param data The data to cast
 * @returns The data cast to the specified type or a default value
 */
export function safeCast<T>(data: unknown, defaultValue: T): T {
  if (data === null || data === undefined) {
    return defaultValue;
  }
  return data as T;
}

/**
 * Safely cast an unknown object to a Record<string, unknown>
 * @param data The data to cast
 * @returns The data cast to Record<string, unknown> or an empty object
 */
export function safeObjectCast(data: unknown): Record<string, unknown> {
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return {};
}

/**
 * Safely cast an unknown array to an array of a specific type
 * @param data The data to cast
 * @param mapper Optional mapping function to apply to each element
 * @returns The data cast to the specified type or an empty array
 */
export function safeArrayCast<T, U = unknown>(
  data: unknown, 
  mapper?: (item: U) => T
): T[] {
  if (!Array.isArray(data)) {
    return [];
  }
  
  if (mapper) {
    return data.map(item => mapper(item as U));
  }
  
  return data as T[];
}

/**
 * Safely access a property from an object with a fallback value
 * @param obj The object to access
 * @param key The property key
 * @param defaultValue Default value if property doesn't exist
 * @returns The property value or default
 */
export function safeGet<T>(obj: unknown, key: string, defaultValue: T): T {
  if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
    return (obj as Record<string, unknown>)[key] as T;
  }
  return defaultValue;
}

/**
 * Safely convert unknown to string
 */
export function safeString(value: unknown, defaultValue = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return defaultValue;
  }
  try {
    return String(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Type guard to check if a value is a valid array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if a value is a valid object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

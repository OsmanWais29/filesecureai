
/**
 * Utility functions for type safety
 */

/**
 * Safely cast an object to a specific type
 * @param obj The object to cast
 * @returns The object cast to the specified type
 */
export function safeObjectCast<T>(obj: unknown): T {
  return obj as T;
}

/**
 * Safely cast an array to a specific type
 * @param arr The array to cast
 * @returns The array cast to the specified type
 */
export function safeArrayCast<T>(arr: unknown): T[] {
  if (!Array.isArray(arr)) {
    return [] as T[];
  }
  return arr as T[];
}

/**
 * Safely access a property from an unknown object
 * @param obj The object to access
 * @param key The property key
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function safeGetProperty<T>(
  obj: unknown,
  key: string,
  defaultValue: T
): T {
  if (obj && typeof obj === 'object' && key in obj) {
    return (obj as Record<string, unknown>)[key] as T;
  }
  return defaultValue;
}

/**
 * Create an empty record with the specified type
 * @returns An empty record
 */
export function createEmptyRecord<T>(): Record<string, T> {
  return {} as Record<string, T>;
}

/**
 * Convert an unknown value to a Record<string, unknown>
 * @param value The value to convert
 * @returns A record object
 */
export function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

/**
 * Convert an unknown value to a string array
 * @param value The value to convert
 * @returns A string array
 */
export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item));
  }
  return [];
}

/**
 * Convert an unknown value to a string
 * @param value The value to convert
 * @param defaultValue Optional default value
 * @returns A string
 */
export function toString(value: unknown, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}

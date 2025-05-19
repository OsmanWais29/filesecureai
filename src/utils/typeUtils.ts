
/**
 * Utility functions for safely handling type conversions
 */

/**
 * Safely converts an unknown type to a Record<string, any> with proper casting
 * @param value The value to convert
 * @returns A safely cast Record or an empty object if conversion is not possible
 */
export function safeObjectCast(value: unknown): Record<string, any> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, any>;
  }
  return {};
}

/**
 * Safely converts an unknown array to a typed array with proper casting
 * @param value The value to convert
 * @param defaultFactory Optional function to create default objects
 * @returns A safely cast array or an empty array if conversion is not possible
 */
export function safeArrayCast<T>(
  value: unknown, 
  defaultFactory?: (item: Record<string, unknown>) => T
): T[] {
  if (Array.isArray(value)) {
    if (defaultFactory) {
      return value.map(item => defaultFactory(safeObjectCast(item)));
    }
    return value as T[];
  }
  return [];
}

/**
 * Safely accesses a property from an unknown object
 * @param obj The object to access
 * @param key The property key to access
 * @param defaultValue The default value to return if property doesn't exist
 * @returns The property value or the default value
 */
export function safeGet<T>(obj: unknown, key: string, defaultValue: T): T {
  if (obj && typeof obj === 'object' && key in (obj as object)) {
    return (obj as any)[key] as T;
  }
  return defaultValue;
}

/**
 * Safely converts an unknown value to string
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns The string value or default value
 */
export function safeStringCast(value: unknown, defaultValue: string = ''): string {
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
 * Safely converts an unknown value to number
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns The number value or default value
 */
export function safeNumberCast(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }
  return defaultValue;
}

/**
 * Safely converts an unknown value to boolean
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns The boolean value or default value
 */
export function safeBooleanCast(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  return defaultValue;
}

/**
 * Type guard to check if value is a valid Record<string, unknown>
 * @param value The value to check
 * @returns Boolean indicating if value is a Record
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && 
         typeof value === 'object' && 
         !Array.isArray(value);
}

/**
 * Type guard to check if value is a valid array
 * @param value The value to check
 * @returns Boolean indicating if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

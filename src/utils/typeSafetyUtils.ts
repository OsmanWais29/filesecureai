
/**
 * Type safety utility functions to handle unknown types safely
 */

/**
 * Convert an unknown value to a string
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns A string
 */
export const toString = (value: unknown, defaultValue: string = ''): string => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  return defaultValue;
};

/**
 * Convert an unknown value to a number
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns A number
 */
export const toNumber = (value: unknown, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  if (typeof value === 'boolean') return value ? 1 : 0;
  return defaultValue;
};

/**
 * Convert an unknown value to a boolean
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns A boolean
 */
export const toBoolean = (value: unknown, defaultValue: boolean = false): boolean => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
  if (typeof value === 'number') return value !== 0;
  return defaultValue;
};

/**
 * Convert an unknown value to an array
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns An array
 */
export const toArray = (value: unknown, defaultValue: any[] = []): any[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return defaultValue;
  return defaultValue;
};

/**
 * Convert an unknown value to a Record/Object
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns A Record/Object
 */
export const toRecord = (value: unknown, defaultValue: Record<string, unknown> = {}): Record<string, unknown> => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return defaultValue;
};

/**
 * Safely spread an unknown object
 * @param obj The object to spread
 * @returns A safe object that can be spread
 */
export const toSafeSpreadObject = (obj: unknown): Record<string, unknown> => {
  return toRecord(obj);
};

/**
 * Convert to a string array safely
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns A string array
 */
export const toStringArray = (value: unknown, defaultValue: string[] = []): string[] => {
  if (!Array.isArray(value)) return defaultValue;
  return value.map(item => toString(item));
};

/**
 * Convert to a number array safely
 * @param value The value to convert
 * @param defaultValue Optional default value if conversion fails
 * @returns A number array
 */
export const toNumberArray = (value: unknown, defaultValue: number[] = []): number[] => {
  if (!Array.isArray(value)) return defaultValue;
  return value.map(item => toNumber(item));
};

/**
 * Safely cast an unknown value to a specific type of array
 * @param value The value to cast
 * @param defaultValue Default value if cast fails
 * @returns The value cast to type T[]
 */
export const toSafeSpreadArray = <T>(value: unknown, defaultValue: T[] = []): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return defaultValue;
};

/**
 * Safely cast an unknown value to a specific type
 * @param value The value to cast
 * @param defaultValue Default value if cast fails
 * @returns The value cast to type T
 */
export const safeObjectCast = <T extends object>(value: unknown, defaultValue: T): T => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object' && value !== null) return value as T;
  return defaultValue;
};

/**
 * Create a safe string for display
 * @param value The value to convert to a string
 * @param defaultValue Default value if conversion fails
 * @returns A safe string for display
 */
export const safeString = (value: unknown, defaultValue: string = ''): string => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return defaultValue;
    }
  }
  return String(value);
};


/**
 * Utility functions for type safety and data conversion
 */

/**
 * Safely casts an unknown value to a string
 * @param value The value to convert to string
 * @returns The string value, or empty string if input is null/undefined
 */
export const toString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  return String(value);
};

/**
 * Converts an unknown value to a Record<string, unknown> safely
 * @param value The value to convert to a record
 * @returns The value as a Record, or an empty object if not convertible
 */
export const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

/**
 * Safely spreads an unknown object
 * @param obj Object to spread
 * @returns A safely spread object, or empty object if input isn't spreadable
 */
export const toSafeSpreadObject = (obj: unknown): Record<string, unknown> => {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    return { ...toRecord(obj) };
  }
  return {};
};

/**
 * Converts an unknown value to a boolean
 * @param value Value to convert
 * @returns Boolean representation of the value
 */
export const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    return lowered === 'true' || lowered === 'yes' || lowered === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return false;
};

/**
 * Converts an unknown value to a number
 * @param value Value to convert
 * @param defaultValue Value to return if conversion fails
 * @returns The numeric value, or the default if conversion fails
 */
export const toNumber = (value: unknown, defaultValue: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

/**
 * Safely converts an unknown value to an array of strings
 * @param value The value to convert
 * @returns An array of strings, or empty array if not convertible
 */
export const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => toString(item));
  }
  return [];
};

/**
 * Safely converts an unknown value to an array of a specific type
 * @param value The value to convert
 * @returns A safely typed array, or empty array if not convertible
 */
export const toSafeSpreadArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
};

/**
 * Safely converts an unknown value to a date
 * @param value The value to convert
 * @returns A Date object, or null if conversion fails
 */
export const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

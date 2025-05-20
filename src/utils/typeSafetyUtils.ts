
/**
 * Type safety utility functions to handle unknown data types safely
 */

/**
 * Safely converts a value to string
 */
export const toString = (value: unknown, defaultValue: string = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  return String(value);
};

/**
 * Safely converts a value to a string array
 */
export const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => toString(item));
  }
  return [];
};

/**
 * Safely converts a value to a number
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
 * Safely converts a value to a boolean
 */
export const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

/**
 * Safely spreads an object that might be unknown
 */
export const toRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>;
  }
  return {};
};

/**
 * Safely converts an unknown array to a typed array
 */
export const toSafeArray = <T>(value: unknown, mapper: (item: unknown) => T): T[] => {
  if (Array.isArray(value)) {
    return value.map(mapper);
  }
  return [];
};

/**
 * Safely get a property from an unknown object
 */
export const getProperty = <T>(obj: unknown, key: string, defaultValue: T): T => {
  if (obj && typeof obj === 'object' && obj !== null && key in obj) {
    return (obj as Record<string, unknown>)[key] as T;
  }
  return defaultValue;
};

/**
 * Safely spread an array that might be unknown
 */
export const toSafeSpreadArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
};

/**
 * Safely handle document_id for Comment objects
 */
export const toSafeComment = (comment: any, documentId: string): any => {
  return {
    ...comment,
    document_id: documentId
  };
};

/**
 * Safely spread an object that might be unknown
 * @param obj Object to spread
 * @returns Safely spread object or empty object
 */
export const toSafeSpreadObject = (obj: unknown): Record<string, unknown> => {
  if (obj && typeof obj === 'object' && obj !== null) {
    return { ...toRecord(obj) };
  }
  return {};
};

/**
 * Safely cast an object to a specific type with type checking
 * @param value Value to cast
 * @returns Safely cast object
 */
export const safeObjectCast = <T extends Record<string, unknown>>(value: unknown): T => {
  if (value && typeof value === 'object' && value !== null) {
    return value as T;
  }
  return {} as T;
};

/**
 * Safely convert a value to an array
 * @param value Value to convert to array
 * @returns Array or empty array
 */
export const toArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
};

/**
 * Safely convert a value to string
 * @param value Value to convert to string
 * @returns String or empty string
 */
export const safeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return '';
};

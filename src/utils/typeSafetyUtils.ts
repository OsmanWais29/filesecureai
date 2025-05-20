
/**
 * Type safety utility functions to handle unknown data types safely
 */

/**
 * Safely converts a value to string
 */
export const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
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
export const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
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

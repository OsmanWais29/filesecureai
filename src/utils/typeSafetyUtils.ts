
/**
 * Utility functions for safely handling unknown types
 */

/**
 * Converts an unknown value to a string
 * @param value Any value that needs to be safely converted to string
 * @param defaultValue Optional default value if value is null/undefined
 * @returns A string representation of the value
 */
export function toString(value: unknown, defaultValue = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}

/**
 * Converts an unknown value to a number
 * @param value Any value that needs to be safely converted to number
 * @param defaultValue Optional default value if value is null/undefined or NaN
 * @returns A number representation of the value or defaultValue if NaN
 */
export function toNumber(value: unknown, defaultValue = 0): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Converts an unknown value to a boolean
 * @param value Any value that needs to be safely converted to boolean
 * @param defaultValue Optional default value if value is null/undefined
 * @returns A boolean representation of the value
 */
export function toBoolean(value: unknown, defaultValue = false): boolean {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return Boolean(value);
}

/**
 * Converts an unknown value to a record object
 * @param value Any value that needs to be safely converted to a record
 * @returns A record object or empty object if value is not an object
 */
export function toRecord(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

/**
 * Safely converts an unknown value to an array
 * @param value Any value that needs to be safely converted to an array
 * @returns An array or empty array if value is not an array
 */
export function toArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }
  return [];
}

/**
 * Creates a safe comment object with document_id added
 * @param comment Comment object with potentially missing document_id
 * @param documentId Document ID to add to the comment
 * @returns Comment object with document_id added
 */
export function toSafeComment(
  comment: { id: string; content: string; created_at: string; user_id: string },
  documentId: string
) {
  return {
    ...comment,
    document_id: documentId
  };
}

/**
 * Safely convert an unknown value to an array and spread it
 * @param value Value to convert and spread
 * @returns Safe array for spreading
 */
export function toSafeSpreadArray<T = unknown>(value: unknown): T[] {
  return toArray<T>(value);
}

/**
 * Safely create a spread object for use in database operations
 * @param obj Object to spread
 * @returns Safe object for spreading
 */
export function toSafeSpreadObject(obj: Record<string, unknown>): Record<string, unknown> {
  return { ...obj };
}

/**
 * Safely cast an unknown value to a specific object type with type checking
 * @param value Value to cast
 * @param defaultObj Default object to return if cast fails
 * @returns The cast object or default object
 */
export function safeObjectCast<T extends Record<string, unknown>>(
  value: unknown, 
  defaultObj: T
): T {
  if (value !== null && typeof value === 'object') {
    return { ...defaultObj, ...value as Record<string, unknown> };
  }
  return defaultObj;
}

/**
 * Converts an unknown value to a string array
 * @param value Any value that needs to be safely converted to a string array
 * @returns A string array or empty array if value is not an array
 */
export function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => toString(item));
  }
  return [];
}

/**
 * Safely converts a value to a string, with additional type checking
 * @param value Value to convert to string
 * @param defaultValue Default if null/undefined
 * @returns Safe string
 */
export function safeString(value: unknown, defaultValue = ''): string {
  return toString(value, defaultValue);
}

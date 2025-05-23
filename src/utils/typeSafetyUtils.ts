
/**
 * Type safety utilities for handling unknown types from API responses
 */

export const toString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
};

export const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const toBoolean = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  return false;
};

export const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined) {
    return [];
  }
  return [value];
};

export const safeObjectCast = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

export const safeArrayCast = <T>(value: unknown, validator?: (item: unknown) => item is T): T[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  
  if (validator) {
    return value.filter(validator);
  }
  
  return value as T[];
};

export const toDate = (value: unknown): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (value instanceof Date) {
    return value;
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
};

export const isValidObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isValidArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isValidString = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0;
};

export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value);
};

// Additional utility functions needed by the codebase
export const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

export const toSafeSpreadArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return [...value] as T[];
  }
  return [];
};

export const toSafeSpreadObject = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...value as Record<string, unknown> };
  }
  return {};
};

export const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => toString(item));
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
};

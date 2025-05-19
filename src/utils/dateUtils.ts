
import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a date string into a human-readable format
 * @param dateString ISO date string
 * @param formatString Date format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, formatString: string = 'MMM d, yyyy'): string => {
  try {
    if (!dateString) return 'N/A';
    
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    if (!isValid(date)) return 'Invalid date';
    
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string with time
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, 'MMM d, yyyy h:mm a');
};

/**
 * Calculate relative time (e.g., "2 days ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string): string => {
  try {
    if (!dateString) return 'N/A';
    
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    
    if (!isValid(date)) return 'Invalid date';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return formatDate(dateString);
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return 'Unknown date';
  }
};

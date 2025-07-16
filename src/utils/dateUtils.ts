import { format, startOfDay, parseISO } from 'date-fns';

/**
 * Get the current date as a string in ISO format
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString();
};

/**
 * Get the current date at midnight (start of day)
 */
export const getCurrentDateAtMidnight = (): Date => {
  return startOfDay(new Date());
};

/**
 * Get midnight timestamp for the current date in local timezone
 */
export const getMidnightTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if it's a new day compared to the last reset date
 */
export const isNewDay = (lastResetDate: string | null): boolean => {
  if (!lastResetDate) {
    return true; // First time, so it's a new day
  }
  
  try {
    const currentDateString = getMidnightTimestamp();
    return currentDateString !== lastResetDate;
  } catch (error) {
    console.error('Error checking if new day:', error);
    return true; // If we can't parse, assume it's a new day
  }
};

/**
 * Format a date for display
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPP'); // e.g., "April 29, 2023"
};

/**
 * Format a date for display with time
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPP p'); // e.g., "April 29, 2023 at 9:00 AM"
};

/**
 * Get a friendly time format
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'p'); // e.g., "9:00 AM"
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = startOfDay(new Date());
  const checkDate = startOfDay(dateObj);
  
  return today.getTime() === checkDate.getTime();
};

/**
 * Get the number of days until midnight (for countdown display)
 */
export const getTimeUntilMidnight = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next midnight
  
  const diff = midnight.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};

/**
 * Format the time until midnight for display
 */
export const formatTimeUntilMidnight = (): string => {
  const { hours, minutes, seconds } = getTimeUntilMidnight();
  
  if (hours > 0) {
    return `${hours}h ${minutes}m until reset`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s until reset`;
  } else {
    return `${seconds}s until reset`;
  }
};
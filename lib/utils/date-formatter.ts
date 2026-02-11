/**
 * Date formatter utility
 * 
 * Handles conversion of blockchain timestamps to ISO 8601 format and
 * other date formatting operations.
 * 
 * Requirements: 13.4 - Date format consistency
 */

/**
 * DateFormatter class
 * 
 * Provides utilities for formatting dates and timestamps, particularly
 * for converting blockchain timestamps to standardized formats.
 */
export class DateFormatter {
  /**
   * Convert a blockchain timestamp to ISO 8601 format
   * 
   * Requirements: 13.4 - Date format consistency
   * 
   * Converts any date/timestamp to ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
   * 
   * @param timestamp - The timestamp to convert (Date, number, or string)
   * @returns ISO 8601 formatted date string
   */
  static toISO8601(timestamp: Date | number | string): string {
    let date: Date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      // Assume milliseconds
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }

    // Validate date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp provided');
    }

    return date.toISOString();
  }

  /**
   * Convert a blockchain block time to Date
   * 
   * @param blockTime - Block timestamp (usually in RFC3339 format or Unix timestamp)
   * @returns Date object
   */
  static fromBlockTime(blockTime: string | number): Date {
    if (typeof blockTime === 'number') {
      // Unix timestamp (seconds or milliseconds)
      const timestamp = blockTime > 10000000000 ? blockTime : blockTime * 1000;
      return new Date(timestamp);
    }

    // RFC3339 or ISO 8601 string
    return new Date(blockTime);
  }

  /**
   * Format a date for display
   * 
   * @param date - The date to format
   * @param includeTime - Whether to include time (default: true)
   * @returns Formatted date string
   */
  static formatForDisplay(date: Date, includeTime: boolean = true): string {
    if (includeTime) {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format a date for CSV export (ISO 8601)
   * 
   * Requirements: 13.4 - Date format consistency
   * 
   * @param date - The date to format
   * @returns ISO 8601 formatted string
   */
  static formatForCSV(date: Date): string {
    return this.toISO8601(date);
  }

  /**
   * Get relative time string (e.g., "2 hours ago")
   * 
   * @param date - The date to format
   * @returns Relative time string
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
      return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
      return this.formatForDisplay(date, false);
    }
  }

  /**
   * Parse a date string in various formats
   * 
   * @param dateString - The date string to parse
   * @returns Date object
   */
  static parse(dateString: string): Date {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }

    return date;
  }

  /**
   * Check if a date is valid
   * 
   * @param date - The date to check
   * @returns true if date is valid
   */
  static isValid(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Convert timezone
   * 
   * Requirements: 13.4 - Timezone conversions
   * 
   * @param date - The date to convert
   * @param timezone - Target timezone (e.g., 'America/New_York')
   * @returns Formatted date string in target timezone
   */
  static convertTimezone(date: Date, timezone: string): string {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  /**
   * Get UTC timestamp
   * 
   * @param date - The date
   * @returns UTC timestamp in milliseconds
   */
  static toUTC(date: Date): number {
    return date.getTime();
  }

  /**
   * Create date from UTC timestamp
   * 
   * @param timestamp - UTC timestamp in milliseconds
   * @returns Date object
   */
  static fromUTC(timestamp: number): Date {
    return new Date(timestamp);
  }
}

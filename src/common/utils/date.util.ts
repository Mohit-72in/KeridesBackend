/**
 * Indian Date Format Utility (DD/MM/YYYY)
 */

export class DateUtil {
    /**
     * Convert Date to Indian format (DD/MM/YYYY)
     * @param date - Date object or string
     * @returns Formatted date string in DD/MM/YYYY
     */
    static toIndianFormat(date: Date | string): string {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    }

    /**
     * Convert Indian format (DD/MM/YYYY) to Date object
     * @param dateString - Date string in DD/MM/YYYY format
     * @returns Date object or null
     */
    static fromIndianFormat(dateString: string): Date | null {
        if (!dateString) return null;

        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    /**
     * Validate Indian date format (DD/MM/YYYY)
     * @param dateString - Date string to validate
     * @returns true if valid, false otherwise
     */
    static isValidIndianFormat(dateString: string): boolean {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

        if (!regex.test(dateString)) return false;

        const match = dateString.match(regex);
        if (!match) return false;

        const [, day, month, year] = match;
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);

        if (m < 1 || m > 12) return false;
        if (d < 1 || d > 31) return false;

        const date = new Date(y, m - 1, d);
        return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    }
}

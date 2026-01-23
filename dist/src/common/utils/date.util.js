"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateUtil = void 0;
class DateUtil {
    static toIndianFormat(date) {
        if (!date)
            return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}/${month}/${year}`;
    }
    static fromIndianFormat(dateString) {
        if (!dateString)
            return null;
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(year, month - 1, day);
    }
    static isValidIndianFormat(dateString) {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!regex.test(dateString))
            return false;
        const match = dateString.match(regex);
        if (!match)
            return false;
        const [, day, month, year] = match;
        const d = parseInt(day);
        const m = parseInt(month);
        const y = parseInt(year);
        if (m < 1 || m > 12)
            return false;
        if (d < 1 || d > 31)
            return false;
        const date = new Date(y, m - 1, d);
        return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    }
}
exports.DateUtil = DateUtil;
//# sourceMappingURL=date.util.js.map
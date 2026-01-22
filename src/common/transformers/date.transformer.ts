import { Injectable } from '@nestjs/common';
import { DateUtil } from '../utils/date.util';

/**
 * Transformer for converting Indian date format (DD/MM/YYYY) to Date objects
 */
@Injectable()
export class DateTransformer {
    /**
     * Transform personalInfo.dob and drivingExperience.licensedSince from Indian format to Date
     */
    transformDates(data: any): any {
        if (!data) return data;

        // Transform personalInfo.dob
        if (data.personalInfo?.dob && typeof data.personalInfo.dob === 'string') {
            const dateStr = data.personalInfo.dob;
            if (DateUtil.isValidIndianFormat(dateStr)) {
                data.personalInfo.dob = DateUtil.fromIndianFormat(dateStr);
            }
        }

        // Transform drivingExperience.licensedSince
        if (data.drivingExperience?.licensedSince && typeof data.drivingExperience.licensedSince === 'string') {
            const dateStr = data.drivingExperience.licensedSince;
            if (DateUtil.isValidIndianFormat(dateStr)) {
                data.drivingExperience.licensedSince = DateUtil.fromIndianFormat(dateStr);
            }
        }

        return data;
    }
}

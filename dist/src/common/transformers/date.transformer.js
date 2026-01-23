"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTransformer = void 0;
const common_1 = require("@nestjs/common");
const date_util_1 = require("../utils/date.util");
let DateTransformer = class DateTransformer {
    transformDates(data) {
        if (!data)
            return data;
        if (data.personalInfo?.dob && typeof data.personalInfo.dob === 'string') {
            const dateStr = data.personalInfo.dob;
            if (date_util_1.DateUtil.isValidIndianFormat(dateStr)) {
                data.personalInfo.dob = date_util_1.DateUtil.fromIndianFormat(dateStr);
            }
        }
        if (data.drivingExperience?.licensedSince && typeof data.drivingExperience.licensedSince === 'string') {
            const dateStr = data.drivingExperience.licensedSince;
            if (date_util_1.DateUtil.isValidIndianFormat(dateStr)) {
                data.drivingExperience.licensedSince = date_util_1.DateUtil.fromIndianFormat(dateStr);
            }
        }
        return data;
    }
};
exports.DateTransformer = DateTransformer;
exports.DateTransformer = DateTransformer = __decorate([
    (0, common_1.Injectable)()
], DateTransformer);
//# sourceMappingURL=date.transformer.js.map
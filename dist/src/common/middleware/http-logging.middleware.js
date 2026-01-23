"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpLoggingMiddleware = void 0;
const common_1 = require("@nestjs/common");
let HttpLoggingMiddleware = class HttpLoggingMiddleware {
    logger = new common_1.Logger('HTTP');
    use = (req, res, next) => {
        const startTime = Date.now();
        const { method, originalUrl, ip } = req;
        res.on('finish', () => {
            const responseTime = Date.now() - startTime;
            const { statusCode } = res;
            try {
                if (statusCode >= 400) {
                    this.logger.error(`${method} ${originalUrl} - ${statusCode} - ${responseTime}ms - IP: ${ip}`);
                }
                else {
                    this.logger.log(`${method} ${originalUrl} - ${statusCode} - ${responseTime}ms`);
                }
            }
            catch (error) {
                console.error('Logging middleware error:', error);
            }
        });
        next();
    };
};
exports.HttpLoggingMiddleware = HttpLoggingMiddleware;
exports.HttpLoggingMiddleware = HttpLoggingMiddleware = __decorate([
    (0, common_1.Injectable)()
], HttpLoggingMiddleware);
//# sourceMappingURL=http-logging.middleware.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingService = void 0;
const common_1 = require("@nestjs/common");
let LoggingService = class LoggingService {
    logger = new common_1.Logger('App');
    info(message, context) {
        this.logger.log(message, context || 'INFO');
    }
    error(message, error, context) {
        this.logger.error(message, error?.stack || '', context || 'ERROR');
    }
    warn(message, context) {
        this.logger.warn(message, context || 'WARN');
    }
    debug(message, context) {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.debug(message, context || 'DEBUG');
        }
    }
    http(method, url, statusCode, responseTime) {
        this.logger.log(`${method} ${url} - ${statusCode} - ${responseTime}ms`, 'HTTP');
    }
};
exports.LoggingService = LoggingService;
exports.LoggingService = LoggingService = __decorate([
    (0, common_1.Injectable)()
], LoggingService);
//# sourceMappingURL=logging.service.js.map
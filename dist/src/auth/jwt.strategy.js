"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const user_service_1 = require("../user/user.service");
const driver_service_1 = require("../driver/driver.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    userService;
    driverService;
    configService;
    logger = new common_1.Logger('JwtStrategy');
    constructor(userService, driverService, configService) {
        const secret = configService.get('JWT_SECRET') ?? 'dev-secret';
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
        this.userService = userService;
        this.driverService = driverService;
        this.configService = configService;
        const fp = require('crypto').createHash('sha256').update(secret || '').digest('hex').slice(0, 8);
        this.logger.debug(`VERIFY secret fingerprint=${fp}`);
    }
    async validate(payload) {
        this.logger.debug(`JWT Payload: ${JSON.stringify(payload)}`);
        if (!payload || !payload.id || !payload.role) {
            this.logger.warn('Invalid JWT payload');
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        if (payload.role === 'USER') {
            const user = await this.userService.findById(payload.id);
            if (!user) {
                this.logger.warn(`User not found for id=${payload.id}`);
                throw new common_1.UnauthorizedException('User not found');
            }
            return { id: payload.id, role: payload.role };
        }
        if (payload.role === 'DRIVER') {
            const driver = await this.driverService.findById(payload.id);
            if (!driver) {
                this.logger.warn(`Driver not found for id=${payload.id}`);
                throw new common_1.UnauthorizedException('Driver not found');
            }
            return { id: payload.id, role: payload.role };
        }
        this.logger.warn(`Unsupported role in token: ${payload.role}`);
        throw new common_1.UnauthorizedException('Invalid token role');
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        driver_service_1.DriverService,
        config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map
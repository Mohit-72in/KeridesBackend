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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const create_user_dto_1 = require("../user/dto/create-user.dto");
const create_driver_dto_1 = require("../driver/dto/create-driver.dto");
const login_user_dto_1 = require("../user/dto/login-user.dto");
const login_driver_dto_1 = require("../driver/dto/login-driver.dto");
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    authService;
    jwtService;
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    registerUser(dto) {
        return this.authService.registerUser(dto);
    }
    registerDriver(dto) {
        if (!dto.phoneNumber || !dto.driverLicenseNumber) {
            throw new common_1.BadRequestException('Phone Number & Driver License Number required');
        }
        return this.authService.registerDriver(dto);
    }
    loginUser(dto) {
        return this.authService.loginUser(dto);
    }
    loginDriver(dto) {
        return this.authService.loginDriver(dto);
    }
    async debugVerifyToken(token, authHeader) {
        if (process.env.NODE_ENV === 'production') {
            throw new common_1.NotFoundException();
        }
        const supplied = token ?? (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : undefined);
        if (!supplied) {
            throw new common_1.BadRequestException('token is required in body or Authorization header');
        }
        const secretFp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 8);
        const tokenPrefix = supplied.slice(0, 8);
        try {
            const payload = this.jwtService.verify(supplied);
            return { valid: true, payload, fingerprints: { verify: secretFp }, tokenPrefix };
        }
        catch (err) {
            return { valid: false, error: err.message, fingerprints: { verify: secretFp }, tokenPrefix };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register-user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)('register-driver'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_driver_dto_1.CreateDriverDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "registerDriver", null);
__decorate([
    (0, common_1.Post)('login-user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_user_dto_1.LoginUserDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginUser", null);
__decorate([
    (0, common_1.Post)('login-driver'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_driver_dto_1.LoginDriverDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "loginDriver", null);
__decorate([
    (0, common_1.Post)('debug/verify-token'),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "debugVerifyToken", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const driver_service_1 = require("../driver/driver.service");
const user_service_1 = require("../user/user.service");
let AuthService = class AuthService {
    driverService;
    userService;
    jwtService;
    constructor(driverService, userService, jwtService) {
        this.driverService = driverService;
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async registerUser(dto) {
        dto.password = await bcrypt.hash(dto.password, 10);
        try {
            const newUser = (await this.userService.create({ ...dto, role: 'USER' }));
            const secretFp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 8);
            const token = this.jwtService.sign({
                id: newUser._id.toString(),
                role: 'USER',
            });
            console.debug(`[AuthService] SIGN fingerprint=${secretFp} tokenPrefix=${token.slice(0, 8)}`);
            return {
                message: 'User Registration Success',
                token,
                role: 'USER',
                user: newUser,
            };
        }
        catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                throw new common_1.ConflictException(`${field.charAt(0).toUpperCase() + field.slice(1)} Already Exists`);
            }
            throw error;
        }
    }
    async registerDriver(dto) {
        dto.password = await bcrypt.hash(dto.password, 10);
        try {
            const newDriver = (await this.driverService.create({ ...dto, role: 'DRIVER' }));
            const secretFp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 8);
            const token = this.jwtService.sign({
                id: newDriver._id.toString(),
                role: 'DRIVER',
            });
            console.debug(`[AuthService] SIGN fingerprint=${secretFp} tokenPrefix=${token.slice(0, 8)}`);
            return {
                message: 'Driver Registration Success',
                token,
                role: 'DRIVER',
                driver: newDriver,
            };
        }
        catch (error) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                throw new common_1.ConflictException(`${field.charAt(0).toUpperCase() + field.slice(1)} Already Exists`);
            }
            throw error;
        }
    }
    async loginUser(dto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid Credentials');
        const match = await bcrypt.compare(dto.password, user.password);
        if (!match)
            throw new common_1.UnauthorizedException('Invalid Credentials');
        const secretFp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 8);
        const token = this.jwtService.sign({
            id: user._id.toString(),
            role: 'USER',
        });
        console.debug(`[AuthService] SIGN fingerprint=${secretFp} tokenPrefix=${token.slice(0, 8)}`);
        return {
            message: 'Login Success',
            token,
            role: 'USER',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        };
    }
    async loginDriver(dto) {
        const driver = await this.driverService.findByEmail(dto.email);
        if (!driver)
            throw new common_1.UnauthorizedException('Invalid Credentials');
        const match = await bcrypt.compare(dto.password, driver.password);
        if (!match)
            throw new common_1.UnauthorizedException('Invalid Credentials');
        const secretFp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 8);
        const token = this.jwtService.sign({
            id: driver._id.toString(),
            role: 'DRIVER',
        });
        console.debug(`[AuthService] SIGN fingerprint=${secretFp} tokenPrefix=${token.slice(0, 8)}`);
        return {
            message: 'Login Success',
            token,
            role: 'DRIVER',
            driver: {
                id: driver._id,
                fullName: driver.fullName,
                email: driver.email,
                phoneNumber: driver.phoneNumber,
                driverLicenseNumber: driver.driverLicenseNumber,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [driver_service_1.DriverService,
        user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
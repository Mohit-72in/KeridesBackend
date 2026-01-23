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
exports.LocationController = void 0;
const common_1 = require("@nestjs/common");
const driver_service_1 = require("./driver.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const role_decorator_1 = require("../common/decorators/role.decorator");
const role_enum_1 = require("../common/role.enum");
let LocationController = class LocationController {
    driverService;
    logger = new common_1.Logger('LocationController');
    constructor(driverService) {
        this.driverService = driverService;
    }
    async updateLocation(req, body) {
        try {
            const driverId = req.user.id;
            const { latitude, longitude, isOnline } = body;
            this.logger.log(`📍 [LOCATION UPDATE] Driver ${driverId} updating location: ${latitude}, ${longitude}`);
            if (latitude === undefined ||
                longitude === undefined ||
                Number.isNaN(latitude) ||
                Number.isNaN(longitude)) {
                this.logger.warn(`⚠️ [LOCATION UPDATE] Invalid coordinates received for driver ${driverId}`);
                return {
                    success: false,
                    message: 'Invalid coordinates',
                };
            }
            const updatedDriver = await this.driverService.updateDriverGeoLocation(driverId, latitude, longitude, isOnline ?? true);
            if (!updatedDriver) {
                this.logger.error(`❌ [LOCATION UPDATE] Failed to update driver ${driverId}`);
                return {
                    success: false,
                    message: 'Failed to update driver location',
                };
            }
            this.logger.log(`✅ [LOCATION UPDATE] Driver ${driverId} location updated: lat=${latitude}, lng=${longitude}, online=${isOnline ?? true}`);
            return {
                success: true,
                message: 'Location updated successfully',
                latitude,
                longitude,
                isOnline: updatedDriver.isOnline,
                timestamp: new Date(),
            };
        }
        catch (error) {
            this.logger.error('❌ Error updating driver location:', error);
            return {
                success: false,
                message: 'Failed to update location',
                error: error.message,
            };
        }
    }
    async goOnline(req, body) {
        try {
            const driverId = req.user.id;
            const { latitude, longitude } = body;
            const updatedDriver = await this.driverService.updateDriverGeoLocation(driverId, latitude, longitude, true);
            if (!updatedDriver) {
                return {
                    success: false,
                    message: 'Failed to set driver online',
                };
            }
            this.logger.log(`✅ Driver ${driverId} is now ONLINE`);
            return {
                success: true,
                message: 'Driver is now online',
                isOnline: true,
            };
        }
        catch (error) {
            this.logger.error('❌ Error setting driver online:', error);
            throw error;
        }
    }
    async goOffline(req) {
        try {
            const driverId = req.user.id;
            await this.driverService.goOffline(driverId);
            this.logger.log(`✅ Driver ${driverId} is now OFFLINE`);
            return {
                success: true,
                message: 'Driver is now offline',
                isOnline: false,
            };
        }
        catch (error) {
            this.logger.error('❌ Error setting driver offline:', error);
            throw error;
        }
    }
};
exports.LocationController = LocationController;
__decorate([
    (0, common_1.Post)('location/update'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Post)('status/online'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "goOnline", null);
__decorate([
    (0, common_1.Post)('status/offline'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "goOffline", null);
exports.LocationController = LocationController = __decorate([
    (0, common_1.Controller)('drivers'),
    __metadata("design:paramtypes", [driver_service_1.DriverService])
], LocationController);
//# sourceMappingURL=location.controller.js.map
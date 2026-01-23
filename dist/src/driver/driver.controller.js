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
exports.DriverController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const driver_service_1 = require("./driver.service");
const update_driver_dto_1 = require("./dto/update-driver.dto");
const update_driver_location_dto_1 = require("./dto/update-driver-location.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const role_decorator_1 = require("../common/decorators/role.decorator");
const role_enum_1 = require("../common/enums/role.enum");
const s3_service_1 = require("../common/services/s3.service");
const driver_notification_service_1 = require("../common/services/driver-notification.service");
let DriverController = class DriverController {
    driverService;
    s3Service;
    notificationService;
    constructor(driverService, s3Service, notificationService) {
        this.driverService = driverService;
        this.s3Service = s3Service;
        this.notificationService = notificationService;
    }
    profile(req) {
        return this.driverService.findById(req.user.id);
    }
    updateDriver(req, updateDto) {
        return this.driverService.updateDriver(req.user.id, updateDto);
    }
    async uploadDocument(req, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        try {
            const { url, key } = await this.s3Service.uploadFile(file, `drivers/${req.user.id}/documents`);
            const updatedDriver = await this.driverService.addDocument(req.user.id, {
                url,
                key,
                fileName: file.originalname,
                fileType: file.mimetype,
            });
            return {
                message: 'Document uploaded successfully',
                url,
                key,
                size: file.size,
                type: file.mimetype,
                driver: updatedDriver,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async resetDrivers() {
        return this.driverService.resetCollection();
    }
    async getAllDrivers(isOnline, area, page = '1', limit = String(driver_service_1.DriverService['DEFAULT_NEARBY_DRIVERS_LIMIT'])) {
        const filter = {};
        if (isOnline !== undefined)
            filter.isOnline = isOnline === 'true';
        if (area)
            filter.area = area;
        const result = await this.driverService.getAllDrivers(filter, Number(page), Number(limit));
        return result;
    }
    async updateDriverLocation(req, locationDto) {
        const updatedDriver = await this.driverService.updateDriverLocation(req.user.id, locationDto.latitude, locationDto.longitude, locationDto.isOnline);
        return {
            message: 'Location updated successfully',
            driver: updatedDriver,
        };
    }
    subscribeToBookings(req, res) {
        const driverId = req.user.id;
        console.log(`🔔 [DRIVER CONTROLLER] Driver ${driverId} subscribed to SSE notifications`);
        this.notificationService.subscribeDriver(driverId, res);
    }
    getNotificationStatus(req) {
        const driverId = req.user.id;
        const isConnected = this.notificationService.isDriverConnected(driverId);
        return {
            driverId,
            isConnected,
            message: isConnected ? 'Connected to ride notifications' : 'Not connected to notifications',
        };
    }
};
exports.DriverController = DriverController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "profile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Patch)('update'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_driver_dto_1.UpdateDriverDto]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "updateDriver", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Post)('upload-document'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Delete)('reset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "resetDrivers", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Query)('isOnline')),
    __param(1, (0, common_1.Query)('area')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "getAllDrivers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Patch)('location'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_driver_location_dto_1.UpdateDriverLocationDto]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "updateDriverLocation", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Get)('subscribe-to-bookings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "subscribeToBookings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    (0, common_1.Get)('notification-status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DriverController.prototype, "getNotificationStatus", null);
exports.DriverController = DriverController = __decorate([
    (0, common_1.Controller)('drivers'),
    __metadata("design:paramtypes", [driver_service_1.DriverService,
        s3_service_1.S3Service,
        driver_notification_service_1.DriverNotificationService])
], DriverController);
//# sourceMappingURL=driver.controller.js.map
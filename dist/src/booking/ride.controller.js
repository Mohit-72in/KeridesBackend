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
exports.RideController = void 0;
const common_1 = require("@nestjs/common");
const ride_service_1 = require("./ride.service");
const booking_service_1 = require("./booking.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const role_decorator_1 = require("../common/decorators/role.decorator");
const role_enum_1 = require("../common/role.enum");
let RideController = class RideController {
    rideService;
    bookingService;
    logger = new common_1.Logger('RideController');
    constructor(rideService, bookingService) {
        this.rideService = rideService;
        this.bookingService = bookingService;
    }
    async createRide(req, rideData) {
        try {
            const customerId = req.user.id;
            const customer = req.user;
            this.logger.log(`📍 Customer ${customerId} requesting ride...`);
            const result = await this.rideService.createRideAndNotifyDrivers(customerId, rideData.pickupLatitude, rideData.pickupLongitude, rideData.dropoffLatitude, rideData.dropoffLongitude, rideData.pickupAddress, rideData.dropoffAddress, rideData.estimatedFare);
            return result;
        }
        catch (error) {
            this.logger.error('Error creating ride:', error);
            throw error;
        }
    }
    async getPendingRides(req) {
        try {
            const driverId = req.user.id;
            const pendingRides = await this.rideService.getPendingRidesForDriver(driverId);
            return {
                success: true,
                count: pendingRides.length,
                rides: pendingRides,
            };
        }
        catch (error) {
            this.logger.error('Error fetching pending rides:', error);
            throw error;
        }
    }
    async acceptRide(req, rideId) {
        try {
            const driverId = req.user.id;
            const result = await this.rideService.acceptRide(rideId, driverId);
            this.logger.log(`✅ Ride ${rideId} accepted by driver ${driverId}`);
            return result;
        }
        catch (error) {
            this.logger.error('Error accepting ride:', error);
            throw error;
        }
    }
    async getRideStatus(req, rideId) {
        try {
            const status = await this.rideService.getRideStatus(rideId);
            return {
                success: true,
                ride: status,
            };
        }
        catch (error) {
            this.logger.error('Error fetching ride status:', error);
            throw error;
        }
    }
    async getDriverLocation(req, rideId) {
        try {
            const location = await this.rideService.getDriverLocation(rideId);
            return {
                success: true,
                location: location,
            };
        }
        catch (error) {
            this.logger.error('Error fetching driver location:', error);
            throw error;
        }
    }
    async rejectRide(req, rideId) {
        const driverId = req.user.id;
        return await this.rideService.rejectRide(rideId, driverId);
    }
    async cancelRide(req, rideId) {
        const driverId = req.user.id;
        const cancelled = await this.bookingService.cancelBooking(rideId, { byDriverId: driverId, reason: 'Driver cancelled the ride' });
        return { success: true, bookingId: cancelled._id?.toString(), status: cancelled.status };
    }
    async getCustomerLocation(req, rideId) {
        try {
            const location = await this.rideService.getCustomerLocation(rideId);
            return {
                success: true,
                location: location,
            };
        }
        catch (error) {
            this.logger.error('Error fetching customer location:', error);
            throw error;
        }
    }
};
exports.RideController = RideController;
__decorate([
    (0, common_1.Post)('create'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "createRide", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "getPendingRides", null);
__decorate([
    (0, common_1.Post)(':rideId/accept'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rideId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "acceptRide", null);
__decorate([
    (0, common_1.Get)(':rideId/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rideId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "getRideStatus", null);
__decorate([
    (0, common_1.Get)(':rideId/driver-location'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rideId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "getDriverLocation", null);
__decorate([
    (0, common_1.Post)(':rideId/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rideId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "rejectRide", null);
__decorate([
    (0, common_1.Post)(':rideId/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rideId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "cancelRide", null);
__decorate([
    (0, common_1.Get)(':rideId/customer-location'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('rideId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], RideController.prototype, "getCustomerLocation", null);
exports.RideController = RideController = __decorate([
    (0, common_1.Controller)('api/rides'),
    __metadata("design:paramtypes", [ride_service_1.RideService, booking_service_1.BookingService])
], RideController);
//# sourceMappingURL=ride.controller.js.map
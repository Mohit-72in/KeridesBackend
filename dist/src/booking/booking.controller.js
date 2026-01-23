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
exports.BookingController = void 0;
const common_1 = require("@nestjs/common");
const booking_service_1 = require("./booking.service");
const create_booking_dto_1 = require("./dto/create-booking.dto");
const rate_booking_dto_1 = require("./dto/rate-booking.dto");
const nearby_drivers_query_dto_1 = require("./dto/nearby-drivers-query.dto");
const find_nearest_drivers_dto_1 = require("./dto/find-nearest-drivers.dto");
const verify_otp_dto_1 = require("./dto/verify-otp.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const role_decorator_1 = require("../common/decorators/role.decorator");
const role_enum_1 = require("../common/role.enum");
let BookingController = class BookingController {
    bookingService;
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    async createBooking(req, createBookingDto) {
        console.log('🔵 [BOOKING CONTROLLER] POST /bookings/create called');
        console.log('🔵 [BOOKING CONTROLLER] User ID:', req.user?.id);
        console.log('🔵 [BOOKING CONTROLLER] User Role:', req.user?.role);
        console.log('🔵 [BOOKING CONTROLLER] Request body:', JSON.stringify(createBookingDto, null, 2));
        const validPaymentMethods = ['CASH', 'CARD', 'UPI', 'WALLET'];
        if (createBookingDto.paymentMethod && !validPaymentMethods.includes(createBookingDto.paymentMethod.toUpperCase())) {
            throw new common_1.BadRequestException(`Invalid payment method. Allowed: ${validPaymentMethods.join(', ')}`);
        }
        if (!createBookingDto.price?.total || createBookingDto.price.total <= 0) {
            throw new common_1.BadRequestException('Invalid fare amount. Fare must be greater than 0');
        }
        if (!createBookingDto.origin?.location?.lat || !createBookingDto.origin?.location?.lng) {
            throw new common_1.BadRequestException('Invalid pickup location');
        }
        if (!createBookingDto.destination?.location?.lat || !createBookingDto.destination?.location?.lng) {
            throw new common_1.BadRequestException('Invalid drop-off location');
        }
        if (!createBookingDto.distance?.value || createBookingDto.distance.value <= 0) {
            throw new common_1.BadRequestException('Invalid distance calculation');
        }
        const result = await this.bookingService.createBooking(req.user.id, createBookingDto);
        console.log('🔵 [BOOKING CONTROLLER] Booking created, returning response');
        return result;
    }
    async getUserBookings(req) {
        return await this.bookingService.getUserBookings(req.user.id);
    }
    async getUserCurrentBooking(req) {
        return await this.bookingService.getUserCurrentBooking(req.user.id);
    }
    async getUserPendingBookings(req) {
        return await this.bookingService.getUserPendingBookings(req.user.id);
    }
    async getPendingBookings() {
        return await this.bookingService.getPendingBookings();
    }
    async getPendingBookingsForDriver(req) {
        return await this.bookingService.getPendingBookingsForDriver(req.user.id);
    }
    async getDriverCurrentBooking(req) {
        return await this.bookingService.getDriverCurrentBooking(req.user.id);
    }
    async getBookingForDriver(bookingId, req) {
        return await this.bookingService.getBookingForDriverById(bookingId, req.user.id);
    }
    async getDriverBookings(req) {
        return await this.bookingService.getBookingsByDriver(req.user.id);
    }
    async getAllDriverBookings(req) {
        return await this.bookingService.getBookingsByDriver(req.user.id);
    }
    async getBookingsForDriverById(driverId, req) {
        const adminKey = process.env.ADMIN_API_KEY || '';
        const provided = (req.headers['x-admin-key'] || req.headers['x-admin-key']?.toString?.()) || '';
        const isSelf = req.user?.id && req.user.id === driverId;
        const isAdminKeyValid = adminKey && provided === adminKey;
        if (!isSelf && !isAdminKeyValid) {
            throw new common_1.ForbiddenException('Not authorized to fetch bookings for this driver');
        }
        return await this.bookingService.getBookingsByDriver(driverId);
    }
    async getDriverCompletedBookings(req) {
        return await this.bookingService.getDriverCompletedBookings(req.user.id);
    }
    async getDriverActiveBookings(req) {
        return await this.bookingService.getDriverActiveBookings(req.user.id);
    }
    async getDriverCancelledBookings(req) {
        return await this.bookingService.getDriverCancelledBookings(req.user.id);
    }
    async getNearbyDrivers(query, req) {
        return await this.bookingService.getNearbyDrivers(req.user.id, query, req.user.role);
    }
    async getNearbyDriversFlexible(query) {
        return await this.bookingService.getNearbyDriversFlexible(query);
    }
    async findNearestDrivers(findNearestDriversDto) {
        return await this.bookingService.findNearestDrivers(findNearestDriversDto.pickupLatitude, findNearestDriversDto.pickupLongitude, findNearestDriversDto.vehicleType);
    }
    async estimateFare(body) {
        const distance = body?.distance?.value || 0;
        const duration = body?.duration?.value || 0;
        const vehicleId = body?.vehicleId;
        const driverId = body?.driverId;
        return await this.bookingService.estimateFare(distance, duration, vehicleId, driverId);
    }
    async acceptBooking(bookingId, req, body) {
        return await this.bookingService.acceptBooking(bookingId, req.user.id, body.vehicleId);
    }
    async driverArrived(bookingId, req) {
        return await this.bookingService.driverArrived(bookingId, req.user.id);
    }
    async verifyOtpAndStartRide(bookingId, req, verifyOtpDto) {
        return await this.bookingService.verifyOtpAndStartRide(bookingId, req.user.id, verifyOtpDto.otp);
    }
    async startRide(bookingId) {
        return await this.bookingService.startRide(bookingId);
    }
    async completeRide(bookingId, req) {
        return await this.bookingService.completeRide(bookingId, req.user.id);
    }
    async getBookingById(bookingId) {
        return await this.bookingService.getBookingById(bookingId);
    }
    async cancelBooking(bookingId) {
        return await this.bookingService.cancelBooking(bookingId);
    }
    async rateBooking(bookingId, rateBookingDto) {
        return await this.bookingService.rateBooking(bookingId, rateBookingDto);
    }
};
exports.BookingController = BookingController;
__decorate([
    (0, common_1.Post)('create'),
    (0, role_decorator_1.RoleRequired)([role_enum_1.Role.USER, role_enum_1.Role.DRIVER]),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_booking_dto_1.CreateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "createBooking", null);
__decorate([
    (0, common_1.Get)('my-bookings'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getUserBookings", null);
__decorate([
    (0, common_1.Get)('my-bookings/current'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getUserCurrentBooking", null);
__decorate([
    (0, common_1.Get)('my-bookings/pending'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getUserPendingBookings", null);
__decorate([
    (0, common_1.Get)('pending/list'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getPendingBookings", null);
__decorate([
    (0, common_1.Get)('pending-for-driver'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getPendingBookingsForDriver", null);
__decorate([
    (0, common_1.Get)('driver/current'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getDriverCurrentBooking", null);
__decorate([
    (0, common_1.Get)('driver/booking/:bookingId'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBookingForDriver", null);
__decorate([
    (0, common_1.Get)('driver/my-bookings'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getDriverBookings", null);
__decorate([
    (0, common_1.Get)('driver/all'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getAllDriverBookings", null);
__decorate([
    (0, common_1.Get)('driver/:driverId/bookings'),
    __param(0, (0, common_1.Param)('driverId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBookingsForDriverById", null);
__decorate([
    (0, common_1.Get)('driver/completed'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getDriverCompletedBookings", null);
__decorate([
    (0, common_1.Get)('driver/active'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getDriverActiveBookings", null);
__decorate([
    (0, common_1.Get)('driver/cancelled'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getDriverCancelledBookings", null);
__decorate([
    (0, common_1.Get)('nearby-drivers'),
    (0, role_decorator_1.RoleRequired)([role_enum_1.Role.USER, role_enum_1.Role.DRIVER]),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nearby_drivers_query_dto_1.NearbyDriversQueryDto, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getNearbyDrivers", null);
__decorate([
    (0, common_1.Get)('nearby-drivers-flexible'),
    (0, role_decorator_1.RoleRequired)([role_enum_1.Role.USER, role_enum_1.Role.DRIVER]),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [nearby_drivers_query_dto_1.NearbyDriversQueryDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getNearbyDriversFlexible", null);
__decorate([
    (0, common_1.Post)('find-nearest-drivers'),
    (0, role_decorator_1.RoleRequired)([role_enum_1.Role.USER, role_enum_1.Role.DRIVER]),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_nearest_drivers_dto_1.FindNearestDriversDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "findNearestDrivers", null);
__decorate([
    (0, common_1.Post)('estimate'),
    (0, role_decorator_1.RoleRequired)([role_enum_1.Role.USER, role_enum_1.Role.DRIVER]),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "estimateFare", null);
__decorate([
    (0, common_1.Post)(':bookingId/accept'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "acceptBooking", null);
__decorate([
    (0, common_1.Patch)(':bookingId/arrived'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "driverArrived", null);
__decorate([
    (0, common_1.Post)(':bookingId/verify-otp'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, verify_otp_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "verifyOtpAndStartRide", null);
__decorate([
    (0, common_1.Patch)(':bookingId/start'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "startRide", null);
__decorate([
    (0, common_1.Patch)(':bookingId/complete'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.DRIVER),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "completeRide", null);
__decorate([
    (0, common_1.Get)(':bookingId'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBookingById", null);
__decorate([
    (0, common_1.Patch)(':bookingId/cancel'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "cancelBooking", null);
__decorate([
    (0, common_1.Post)(':bookingId/rate'),
    (0, role_decorator_1.RoleRequired)(role_enum_1.Role.USER),
    __param(0, (0, common_1.Param)('bookingId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, rate_booking_dto_1.RateBookingDto]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "rateBooking", null);
exports.BookingController = BookingController = __decorate([
    (0, common_1.Controller)('bookings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [booking_service_1.BookingService])
], BookingController);
//# sourceMappingURL=booking.controller.js.map
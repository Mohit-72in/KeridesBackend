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
exports.RideService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_schema_1 = require("../schemas/booking.schema");
const driver_schema_1 = require("../schemas/driver.schema");
const vehicle_schema_1 = require("../schemas/vehicle.schema");
const geolocation_util_1 = require("../common/utils/geolocation.util");
const fare_util_1 = require("../common/utils/fare.util");
const mail_service_1 = require("../common/services/mail.service");
let RideService = class RideService {
    bookingModel;
    driverModel;
    vehicleModel;
    mailService;
    logger = new common_1.Logger('RideService');
    constructor(bookingModel, driverModel, vehicleModel, mailService) {
        this.bookingModel = bookingModel;
        this.driverModel = driverModel;
        this.vehicleModel = vehicleModel;
        this.mailService = mailService;
    }
    async createRideAndNotifyDrivers(customerId, pickupLat, pickupLng, dropoffLat, dropoffLng, pickupAddress, dropoffAddress, estimatedFare) {
        try {
            const booking = new this.bookingModel({
                userId: customerId,
                status: 'PENDING',
                pickupLatitude: pickupLat,
                pickupLongitude: pickupLng,
                dropoffLatitude: dropoffLat,
                dropoffLongitude: dropoffLng,
                pickupLocation: pickupAddress,
                dropoffLocation: dropoffAddress,
                estimatedFare: estimatedFare,
                bookingTime: new Date(),
            });
            const savedBooking = await booking.save();
            this.logger.log(`✅ Ride created: ${savedBooking._id}`);
            const now = new Date();
            const allOnlineDrivers = await this.driverModel.find({
                isOnline: true,
                latitude: { $exists: true, $ne: null },
                longitude: { $exists: true, $ne: null },
                $or: [
                    { busyUntil: { $lte: now } },
                    { busyUntil: null },
                    { busyUntil: { $exists: false } },
                ],
            }).lean();
            const nearbyDrivers = (0, geolocation_util_1.findDriversWithinRadius)(pickupLat, pickupLng, allOnlineDrivers, 2);
            this.logger.log(`🔍 Found ${nearbyDrivers.length} drivers within 2 KM radius`);
            const rideRequests = nearbyDrivers.map((driver) => ({
                bookingId: savedBooking._id.toString(),
                driverId: driver._id.toString(),
                status: 'PENDING',
                createdAt: new Date(),
            }));
            try {
                savedBooking.expiresAt = new Date(Date.now() + 3 * 60 * 1000);
                await savedBooking.save();
                setTimeout(async () => {
                    try {
                        const fresh = await this.bookingModel.findById(savedBooking._id);
                        if (fresh && fresh.status === 'PENDING') {
                            fresh.status = 'CANCELLED';
                            await fresh.save();
                            this.logger.log(`⏰ Booking ${fresh._id} auto-cancelled after 3 minutes`);
                            if (Array.isArray(fresh.rejectedDrivers) && fresh.rejectedDrivers.length > 0) {
                                const busyUntil = new Date(Date.now() + 3 * 60 * 1000);
                                await this.driverModel.updateMany({ _id: { $in: fresh.rejectedDrivers } }, { $set: { busyUntil } });
                            }
                        }
                    }
                    catch (e) {
                        this.logger.error('Error during auto-cancel timeout handling', e);
                    }
                }, 3 * 60 * 1000);
            }
            catch (err) {
                this.logger.error('Error scheduling booking expiry', err);
            }
            return {
                bookingId: savedBooking._id.toString(),
                status: 'PENDING',
                driversNotified: nearbyDrivers.length,
                nearbyDrivers: nearbyDrivers.map((d) => ({
                    driverId: d._id.toString(),
                    name: d.fullName,
                    distance: d.distance,
                })),
            };
        }
        catch (error) {
            this.logger.error('Error creating ride:', error);
            throw new common_1.BadRequestException('Failed to create ride: ' + error.message);
        }
    }
    async getPendingRidesForDriver(driverId) {
        try {
            const _driverQuery = this.driverModel.findById(driverId);
            const driver = (_driverQuery && typeof _driverQuery.lean === 'function')
                ? await _driverQuery.lean()
                : await _driverQuery;
            if (!driver || !driver.latitude || !driver.longitude) {
                return [];
            }
            const pendingBookings = await this.bookingModel
                .find({ status: 'PENDING' })
                .populate('userId', 'fullName phoneNumber')
                .lean();
            const _vehicleQuery = this.vehicleModel.findOne({ driverId });
            const driverVehicle = (_vehicleQuery && typeof _vehicleQuery.lean === 'function')
                ? await _vehicleQuery.lean()
                : await _vehicleQuery;
            const driverFareStructure = driverVehicle?.fareStructure || null;
            const availableRides = pendingBookings
                .filter((booking) => {
                if (!booking.pickupLatitude || !booking.pickupLongitude) {
                    return false;
                }
                if (booking.driverId && booking.driverId.toString() !== driverId) {
                    return false;
                }
                const rejectedByThisDriver = Array.isArray(booking.rejectedDrivers) && booking.rejectedDrivers.some((id) => id?.toString?.() === driverId);
                if (rejectedByThisDriver)
                    return false;
                const distance = (0, geolocation_util_1.calculateDistance)(driver.latitude, driver.longitude, booking.pickupLatitude, booking.pickupLongitude);
                return distance <= 2;
            })
                .map((booking) => {
                let estimatedFare = booking.estimatedFare || 0;
                const distanceInKm = (booking.distance?.value || 0) / 1000;
                const durationInSeconds = booking.duration?.value || 0;
                if (driverFareStructure) {
                    try {
                        estimatedFare = (0, fare_util_1.calculateFare)({
                            distanceInKm,
                            durationInSeconds,
                            fareStructure: {
                                minimumFare: driverFareStructure.minimumFare || 0,
                                perKilometerRate: driverFareStructure.perKilometerRate || 0,
                                waitingChargePerMinute: driverFareStructure.waitingChargePerMinute || 0,
                            },
                            baseFare: 0,
                        });
                    }
                    catch (e) {
                    }
                }
                return {
                    bookingId: booking._id.toString(),
                    customerId: booking.userId?._id?.toString() || booking.userId?.toString?.(),
                    customerName: booking.userId.fullName || 'Customer',
                    customerPhone: booking.userId.phoneNumber || 'N/A',
                    pickupLocation: booking.pickupLocation,
                    dropoffLocation: booking.dropoffLocation,
                    pickupLatitude: booking.pickupLatitude,
                    pickupLongitude: booking.pickupLongitude,
                    estimatedFare: estimatedFare,
                    estimatedDistance: booking.estimatedDistance || (booking.distance?.value ? booking.distance.value / 1000 : undefined),
                    status: booking.status,
                };
            });
            return availableRides;
        }
        catch (error) {
            this.logger.error('Error fetching pending rides for driver:', error);
            return [];
        }
    }
    async acceptRide(bookingId, driverId) {
        try {
            const booking = await this.bookingModel.findById(bookingId);
            if (!booking) {
                throw new common_1.BadRequestException('Booking not found');
            }
            if (booking.status !== 'PENDING') {
                throw new common_1.BadRequestException(`Booking is no longer available (status: ${booking.status})`);
            }
            booking.driverId = new mongoose_2.Types.ObjectId(driverId);
            booking.status = 'ACCEPTED';
            booking.acceptedTime = new Date();
            const updatedBooking = await booking.save();
            this.logger.log(`✅ Driver ${driverId} accepted ride ${bookingId}`);
            try {
                const user = await this.bookingModel.findById(bookingId).populate('userId', 'fullName email').exec();
                const userEmail = user?.userId?.email || user?.userId?.phone || null;
                const userName = user?.userId?.fullName || '';
                const _driverQuery2 = this.driverModel.findById(driverId);
                const driver = (_driverQuery2 && typeof _driverQuery2.lean === 'function')
                    ? await _driverQuery2.lean()
                    : await _driverQuery2;
                const driverName = driver?.fullName || 'Driver';
                if (userEmail && this.mailService) {
                    await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'ACCEPTED', updatedBooking?.toObject?.() || {});
                }
            }
            catch (emailErr) {
                this.logger.error('Failed to send acceptance email to user', emailErr);
            }
            return {
                bookingId: updatedBooking._id.toString(),
                status: 'ACCEPTED',
                message: 'Ride accepted successfully',
            };
        }
        catch (error) {
            this.logger.error('Error accepting ride:', error);
            throw error;
        }
    }
    async getRideStatus(bookingId) {
        try {
            const booking = await this.bookingModel
                .findById(bookingId)
                .populate('driverId', 'fullName phoneNumber profileImage')
                .populate('vehicleId', 'vehicleModel licensePlate vehicleImages')
                .lean();
            if (!booking) {
                throw new common_1.BadRequestException('Ride not found');
            }
            return {
                bookingId: booking._id.toString(),
                status: booking.status,
                driver: booking.driverId
                    ? {
                        driverId: booking.driverId._id?.toString(),
                        name: booking.driverId.fullName,
                        phone: booking.driverId.phoneNumber,
                        photo: booking.driverId.profileImage,
                    }
                    : null,
                vehicle: booking.vehicleId
                    ? {
                        vehicleId: booking.vehicleId._id?.toString(),
                        model: booking.vehicleId.vehicleModel,
                        licensePlate: booking.vehicleId.licensePlate,
                        photos: booking.vehicleId.vehicleImages,
                    }
                    : null,
                pickupLocation: booking.pickupLocation,
                dropoffLocation: booking.dropoffLocation,
                estimatedFare: booking.estimatedFare,
            };
        }
        catch (error) {
            this.logger.error('Error fetching ride status:', error);
            throw error;
        }
    }
    async getDriverLocation(bookingId) {
        try {
            const booking = await this.bookingModel
                .findById(bookingId)
                .populate('driverId', 'latitude longitude')
                .lean();
            if (!booking || !booking.driverId) {
                throw new common_1.BadRequestException('Driver not found for this booking');
            }
            return {
                driverId: booking.driverId._id?.toString(),
                latitude: booking.driverId.latitude,
                longitude: booking.driverId.longitude,
                lastUpdated: booking.driverId.lastLocationUpdate,
            };
        }
        catch (error) {
            this.logger.error('Error fetching driver location:', error);
            throw error;
        }
    }
    async rejectRide(bookingId, driverId) {
        try {
            const booking = await this.bookingModel.findById(bookingId);
            if (!booking) {
                throw new common_1.BadRequestException('Booking not found');
            }
            if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
                throw new common_1.BadRequestException(`Cannot reject ride with status: ${booking.status}`);
            }
            if (!booking.rejectedDrivers) {
                booking.rejectedDrivers = [];
            }
            booking.rejectedDrivers.push(new mongoose_2.Types.ObjectId(driverId));
            let responsePayload = {};
            if (booking.driverId?.toString() === driverId) {
                booking.driverId = undefined;
                booking.status = 'REJECTED';
                booking.acceptedTime = undefined;
                try {
                    const populated = await this.bookingModel.findById(bookingId).populate('userId', 'fullName email').exec();
                    const userEmail = populated?.userId?.email || null;
                    const userName = populated?.userId?.fullName || '';
                    const _driverQuery3 = this.driverModel.findById(driverId);
                    const driver = (_driverQuery3 && typeof _driverQuery3.lean === 'function')
                        ? await _driverQuery3.lean()
                        : await _driverQuery3;
                    const driverName = driver?.fullName || 'Driver';
                    if (userEmail) {
                        await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'REJECTED', populated?.toObject?.() || booking?.toObject?.());
                    }
                }
                catch (emailErr) {
                    this.logger.error('Failed to send rejection email to user', emailErr);
                }
                responsePayload = {
                    bookingId: booking._id.toString(),
                    status: 'REJECTED',
                    message: 'Booking rejected by assigned driver',
                    rejectionCount: booking.rejectedDrivers?.length ?? 0,
                };
            }
            else {
                try {
                    const busyUntil = new Date(Date.now() + 3 * 60 * 1000);
                    await this.driverModel.findByIdAndUpdate(driverId, { $set: { busyUntil } });
                }
                catch (e) {
                    this.logger.error('Failed to mark driver busy after rejection', e);
                }
                responsePayload = {
                    bookingId: booking._id.toString(),
                    status: 'PENDING',
                    message: 'Ride rejected. Notifying other drivers...',
                    rejectionCount: booking.rejectedDrivers?.length ?? 0,
                };
            }
            const updatedBooking = await booking.save();
            this.logger.log(`❌ Driver ${driverId} rejected ride ${bookingId}`);
            return responsePayload;
        }
        catch (error) {
            this.logger.error('Error rejecting ride:', error);
            throw error;
        }
    }
    async getCustomerLocation(bookingId) {
        try {
            const booking = await this.bookingModel
                .findById(bookingId)
                .lean();
            if (!booking) {
                throw new common_1.BadRequestException('Booking not found');
            }
            return {
                customerId: booking.userId.toString(),
                latitude: booking.pickupLatitude,
                longitude: booking.pickupLongitude,
                address: booking.pickupLocation,
            };
        }
        catch (error) {
            this.logger.error('Error fetching customer location:', error);
            throw error;
        }
    }
};
exports.RideService = RideService;
exports.RideService = RideService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(1, (0, mongoose_1.InjectModel)(driver_schema_1.Driver.name)),
    __param(2, (0, mongoose_1.InjectModel)(vehicle_schema_1.Vehicle.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mail_service_1.MailService])
], RideService);
//# sourceMappingURL=ride.service.js.map
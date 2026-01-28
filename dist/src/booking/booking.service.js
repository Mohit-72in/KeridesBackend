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
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const booking_schema_1 = require("../schemas/booking.schema");
const driver_schema_1 = require("../schemas/driver.schema");
const vehicle_schema_1 = require("../schemas/vehicle.schema");
const user_schema_1 = require("../schemas/user.schema");
const geolocation_util_1 = require("../common/utils/geolocation.util");
const driver_notification_service_1 = require("../common/services/driver-notification.service");
const mail_service_1 = require("../common/services/mail.service");
const DEFAULT_NEARBY_DRIVERS_RADIUS_KM = parseFloat(process.env.NEARBY_DRIVERS_RADIUS_KM || '5');
const NEARBY_DRIVERS_LIMIT = parseInt(process.env.NEARBY_DRIVERS_LIMIT || '10', 10);
const DEFAULT_MINIMUM_FARE = parseFloat(process.env.DEFAULT_MINIMUM_FARE || '50');
const DEFAULT_PER_KM_RATE = parseFloat(process.env.DEFAULT_PER_KM_RATE || '15');
const DEFAULT_WAITING_CHARGE_PER_MIN = parseFloat(process.env.DEFAULT_WAITING_CHARGE_PER_MIN || '1');
let BookingService = class BookingService {
    bookingModel;
    driverModel;
    vehicleModel;
    userModel;
    notificationService;
    mailService;
    logger = new common_1.Logger('BookingService');
    constructor(bookingModel, driverModel, vehicleModel, userModel, notificationService, mailService) {
        this.bookingModel = bookingModel;
        this.driverModel = driverModel;
        this.vehicleModel = vehicleModel;
        this.userModel = userModel;
        this.notificationService = notificationService;
        this.mailService = mailService;
    }
    calculateBookingFare(distanceInMeters, durationInSeconds, vehicleData) {
        const distanceInKm = Number(distanceInMeters ?? 0) / 1000;
        const rawFareStructure = vehicleData?.details?.fareStructure || {};
        const perKilometerRate = (rawFareStructure.perKilometerRate ?? rawFareStructure.perKmRate) ??
            DEFAULT_PER_KM_RATE;
        const minimumFare = rawFareStructure.minimumFare ?? DEFAULT_MINIMUM_FARE;
        const waitingChargePerMinute = (rawFareStructure.waitingChargePerMinute ?? rawFareStructure.waitingChargePerMin) ??
            DEFAULT_WAITING_CHARGE_PER_MIN;
        const baseFare = rawFareStructure.baseFare ?? 0;
        const waitingMinutes = Math.max(0, Math.ceil(Number(durationInSeconds ?? 0) / 60));
        const raw = baseFare + perKilometerRate * distanceInKm + waitingChargePerMinute * waitingMinutes;
        const fare = Math.max(Number(raw.toFixed(2)), minimumFare || 0);
        this.logger.debug(`[FareCalc] distanceMeters=${distanceInMeters}, distanceKm=${distanceInKm}, durationSec=${durationInSeconds}, perKm=${perKilometerRate}, baseFare=${baseFare}, waitingMin=${waitingChargePerMinute}, waitingMinutes=${waitingMinutes}, minimumFare=${minimumFare}, computed=${fare}`);
        if (fare === 0) {
            this.logger.warn(`[FareCalc] computed fare is 0 — verify vehicle/driver fare setup or input distance. distanceInKm=${distanceInKm}, perKilometerRate=${perKilometerRate}, base=${baseFare}, minFare=${minimumFare}`);
        }
        return fare;
    }
    generateOtp() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
    generateBookingId() {
        return `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    toObjectId(id) {
        if (!id) {
            this.logger.debug(`ℹ️ toObjectId received empty/undefined: ${id}`);
            return undefined;
        }
        try {
            if (mongoose_2.Types.ObjectId.isValid(id)) {
                this.logger.debug(`✅ Valid ObjectId: ${id}`);
                return new mongoose_2.Types.ObjectId(id);
            }
            this.logger.warn(`⚠️ Invalid ObjectId format received: "${id}" (length: ${id.length})`);
            return undefined;
        }
        catch (error) {
            this.logger.warn(`⚠️ Error converting to ObjectId: "${id}" - ${error.message}`);
            return undefined;
        }
    }
    async formatDriverForBooking(driverId, vehicleId) {
        try {
            const driver = await this.driverModel.findById(driverId).exec();
            if (!driver) {
                return null;
            }
            const vehicles = await this.vehicleModel.find({ driverId }).exec();
            return {
                id: driver._id.toString(),
                details: {
                    _id: driver._id.toString(),
                    name: driver.fullName,
                    email: driver.email,
                    phone: driver.phoneNumber,
                    imageUrl: driver.profileImage || '',
                    drivinglicenseNo: driver.driverLicenseNumber,
                    agreement: true,
                    personalInfo: {
                        dob: driver.personalInfo?.dob?.toISOString().split('T')[0] || '',
                        address: driver.personalInfo?.emergencyContact?.name || driver.address || '',
                        area: driver.operatingArea || '',
                        bloodGroup: driver.personalInfo?.bloodGroup || '',
                        emergencyContact: driver.personalInfo?.emergencyContact?.phone || '',
                        languages: driver.personalInfo?.languages || [],
                        certifications: driver.personalInfo?.certificates || [],
                    },
                    vehicles: vehicles.map(v => ({
                        _id: v._id.toString(),
                        make: v.make,
                        vehicleModel: v.vehicleModel,
                        vehicleType: v.vehicleType,
                        vehicleClass: v.vehicleClass,
                        year: v.year,
                        licensePlate: v.licensePlate,
                        seatsNo: v.seatsNo,
                        vehicleImages: v.vehicleImages || [],
                        fareStructure: {
                            minimumFare: v.fareStructure?.minimumFare || 0,
                            perKilometerRate: v.fareStructure?.perKilometerRate || 0,
                            waitingChargePerMinute: v.fareStructure?.waitingChargePerMinute || 0,
                        },
                        driverId: v.driverId.toString(),
                    })),
                },
            };
        }
        catch (error) {
            console.error('Error formatting driver for booking:', error);
            return null;
        }
    }
    async formatVehicleForBooking(vehicleId) {
        try {
            const vehicle = await this.vehicleModel.findById(vehicleId).exec();
            if (!vehicle) {
                return null;
            }
            return {
                id: vehicle._id.toString(),
                details: {
                    _id: vehicle._id.toString(),
                    make: vehicle.make,
                    vehicleModel: vehicle.vehicleModel,
                    vehicleType: vehicle.vehicleType,
                    vehicleClass: vehicle.vehicleClass,
                    year: vehicle.year,
                    licensePlate: vehicle.licensePlate,
                    seatsNo: vehicle.seatsNo,
                    vehicleImages: vehicle.vehicleImages || [],
                    driverId: vehicle.driverId.toString(),
                    fareStructure: {
                        minimumFare: vehicle.fareStructure?.minimumFare || 0,
                        perKilometerRate: vehicle.fareStructure?.perKilometerRate || 0,
                        waitingChargePerMinute: vehicle.fareStructure?.waitingChargePerMinute || 0,
                    },
                },
            };
        }
        catch (error) {
            console.error('Error formatting vehicle for booking:', error);
            return null;
        }
    }
    async createBooking(userId, createBookingDto) {
        try {
            console.log('📝 [BOOKING SERVICE] Creating booking for user:', userId);
            console.log('📝 [BOOKING SERVICE] Booking DTO:', JSON.stringify(createBookingDto, null, 2));
            const rideOtp = this.generateOtp();
            const bookingId = this.generateBookingId();
            console.log('📝 [BOOKING SERVICE] Generated OTP:', rideOtp);
            console.log('📝 [BOOKING SERVICE] Generated Booking ID:', bookingId);
            let driverData = null;
            let vehicleData = null;
            if (createBookingDto.selectedDriverId) {
                driverData = await this.formatDriverForBooking(createBookingDto.selectedDriverId, createBookingDto.selectedVehicleId);
            }
            if (createBookingDto.selectedVehicleId) {
                vehicleData = await this.formatVehicleForBooking(createBookingDto.selectedVehicleId);
            }
            const calculatedFare = this.calculateBookingFare(createBookingDto.distance.value, createBookingDto.duration.value, vehicleData);
            const providedTotal = createBookingDto.price?.total;
            let finalTotal = typeof providedTotal === 'number' && providedTotal > 0 ? providedTotal : calculatedFare;
            if (!finalTotal || finalTotal <= 0) {
                this.logger.warn('[BookingService] finalTotal <= 0, falling back to calculatedFare or minimum fare');
                finalTotal = Math.max(calculatedFare, DEFAULT_MINIMUM_FARE);
            }
            const bookingData = {
                bookingId: bookingId,
                userId,
                userInfo: {
                    _id: this.toObjectId(userId),
                    email: createBookingDto.userInfo.email || '',
                    name: createBookingDto.userInfo.name,
                    phone: createBookingDto.userInfo.phone,
                    date: createBookingDto.userInfo.date,
                    time: createBookingDto.userInfo.time,
                    scheduledDateTime: createBookingDto.userInfo.scheduledDateTime,
                    address: createBookingDto.userInfo.address || '',
                    bloodGroup: createBookingDto.userInfo.bloodGroup || '',
                },
                origin: {
                    address: createBookingDto.origin.address,
                    location: {
                        lat: createBookingDto.origin.location.lat,
                        lng: createBookingDto.origin.location.lng,
                    },
                },
                destination: {
                    address: createBookingDto.destination.address,
                    location: {
                        lat: createBookingDto.destination.location.lat,
                        lng: createBookingDto.destination.location.lng,
                    },
                },
                distance: {
                    text: createBookingDto.distance.text,
                    value: createBookingDto.distance.value,
                },
                duration: {
                    text: createBookingDto.duration.text,
                    value: createBookingDto.duration.value,
                },
                route: {
                    summary: createBookingDto.route.summary,
                    polyline: createBookingDto.route.polyline,
                    waypoints: createBookingDto.route.waypoints || [],
                    ...(createBookingDto.route.bounds && { bounds: createBookingDto.route.bounds }),
                },
                price: {
                    baseFare: createBookingDto.price.baseFare || 0,
                    minimumFare: createBookingDto.price.minimumFare,
                    bookingFee: createBookingDto.price.bookingFee,
                    total: finalTotal,
                },
                estimatedFare: finalTotal,
                calculatedFare: calculatedFare,
                driver: driverData,
                vehicle: vehicleData,
                status: 'PENDING',
                confirmationStatus: 'PENDING_DRIVER',
                rideOtp: rideOtp,
                otpVerified: false,
                paymentMethod: createBookingDto.paymentMethod?.toUpperCase() || 'CASH',
                paymentCompleted: false,
                userNotes: createBookingDto.userNotes || '',
                vehiclePreference: createBookingDto.vehiclePreference,
                passengers: createBookingDto.passengers || 1,
                timestamp: new Date(),
                statusHistory: [
                    {
                        status: 'PENDING',
                        confirmationStatus: 'PENDING_DRIVER',
                        timestamp: new Date(),
                        notes: 'Booking created - waiting for driver acceptance',
                        changedBy: 'SYSTEM',
                    },
                ],
                driverId: this.toObjectId(createBookingDto.selectedDriverId),
                vehicleId: this.toObjectId(createBookingDto.selectedVehicleId),
                pickupLocation: createBookingDto.origin.address,
                dropoffLocation: createBookingDto.destination.address,
                pickupLatitude: createBookingDto.origin.location.lat,
                pickupLongitude: createBookingDto.origin.location.lng,
                dropoffLatitude: createBookingDto.destination.location.lat,
                dropoffLongitude: createBookingDto.destination.location.lng,
                estimatedDistance: createBookingDto.distance.value / 1000,
                bookingTime: new Date(createBookingDto.userInfo.scheduledDateTime || Date.now()),
            };
            console.log('📝 [BOOKING SERVICE] Booking data prepared:', JSON.stringify(bookingData, null, 2));
            const booking = new this.bookingModel(bookingData);
            console.log('📝 [BOOKING SERVICE] Booking model created');
            const savedBooking = await booking.save();
            console.log('✅ [BOOKING SERVICE] Booking saved successfully:', savedBooking._id);
            console.log('✅ [BOOKING SERVICE] Booking ID:', savedBooking.bookingId);
            console.log('✅ [BOOKING SERVICE] Full saved booking:', JSON.stringify(savedBooking.toObject(), null, 2));
            const bookingNotificationData = {
                bookingId: savedBooking.bookingId,
                userId: savedBooking.userId,
                userInfo: savedBooking.userInfo,
                origin: savedBooking.origin,
                destination: savedBooking.destination,
                distance: savedBooking.distance,
                duration: savedBooking.duration,
                price: savedBooking.price,
                vehiclePreference: savedBooking.vehiclePreference,
                passengers: savedBooking.passengers,
                rideOtp: savedBooking.rideOtp,
                timestamp: savedBooking.timestamp,
            };
            if (createBookingDto.selectedDriverId) {
                this.logger.log(`🎯 [BOOKING SERVICE] User booked specific driver: ${createBookingDto.selectedDriverId}`);
                try {
                    const success = this.notificationService.notifyDriver(createBookingDto.selectedDriverId, bookingNotificationData);
                    if (success) {
                        this.logger.log(`✅ Notification sent to specific driver ${createBookingDto.selectedDriverId}`);
                    }
                    else {
                        this.logger.warn(`⚠️ Specific driver ${createBookingDto.selectedDriverId} is not connected to SSE. They will see the booking when they poll the endpoint.`);
                    }
                    try {
                        const driverEmail = driverData?.details?.email;
                        const driverName = driverData?.details?.name;
                        if (driverEmail) {
                            await this.mailService.sendDriverAssignedEmail(driverEmail, driverName, savedBooking.toObject());
                        }
                    }
                    catch (emailErr) {
                        this.logger.error(`❌ Failed to send assigned-driver email: ${emailErr?.message || emailErr}`);
                    }
                }
                catch (notificationError) {
                    this.logger.error(`❌ Error notifying specific driver: ${notificationError.message}`);
                }
            }
            else {
                this.logger.log(`🔔 [BOOKING SERVICE] No driver selected. Finding nearby drivers for booking ${savedBooking.bookingId}`);
                try {
                    const pickupLat = createBookingDto.origin.location.lat;
                    const pickupLng = createBookingDto.origin.location.lng;
                    const allOnlineDrivers = await this.driverModel.find({
                        isOnline: true,
                        latitude: { $exists: true, $ne: null },
                        longitude: { $exists: true, $ne: null },
                    }).lean();
                    const nearbyDrivers = (0, geolocation_util_1.findDriversWithinRadius)(pickupLat, pickupLng, allOnlineDrivers, DEFAULT_NEARBY_DRIVERS_RADIUS_KM);
                    this.logger.log(`🔍 Found ${nearbyDrivers.length} drivers within 5 KM radius`);
                    if (nearbyDrivers.length > 0) {
                        let sent = 0;
                        let failed = 0;
                        for (const driver of nearbyDrivers) {
                            try {
                                if (driver.busyUntil && new Date(driver.busyUntil) > new Date()) {
                                    this.logger.log(`⚠️ Skipping busy driver ${driver._id} (busy until ${driver.busyUntil})`);
                                    failed++;
                                    continue;
                                }
                                if (Array.isArray(savedBooking.rejectedDrivers) && savedBooking.rejectedDrivers.some((id) => id?.toString?.() === driver._id.toString())) {
                                    this.logger.log(`⚠️ Skipping driver ${driver._id} who already rejected booking ${savedBooking.bookingId}`);
                                    failed++;
                                    continue;
                                }
                                const distanceMeters = savedBooking.distance?.value ?? (savedBooking.estimatedDistance ? savedBooking.estimatedDistance * 1000 : 0);
                                const durationSeconds = savedBooking.duration?.value ?? 0;
                                const fareEstimate = await this.estimateFare(distanceMeters, durationSeconds, undefined, driver._id.toString());
                                const perDriverNotification = {
                                    ...bookingNotificationData,
                                    customerPhone: savedBooking.userInfo?.phone || '',
                                    distanceToPickupKm: driver.distance || null,
                                    estimatedFare: fareEstimate?.estimatedFare ?? bookingNotificationData.price,
                                };
                                const success = this.notificationService.notifyDriver(driver._id.toString(), perDriverNotification);
                                if (success) {
                                    sent++;
                                }
                                else {
                                    failed++;
                                }
                            }
                            catch (err) {
                                this.logger.error(`❌ Error notifying driver ${driver._id}: ${err?.message || err}`);
                                failed++;
                            }
                        }
                        this.logger.log(`✅ SSE Notifications sent: ${sent} drivers notified, ${failed} not connected or skipped`);
                        if (failed > 0) {
                            this.logger.warn(`⚠️ ${failed} drivers were not connected or were skipped. They will still see the booking when they poll the endpoint.`);
                        }
                    }
                    else {
                        this.logger.warn(`⚠️ No online drivers found within 5 KM radius for booking ${savedBooking.bookingId}`);
                    }
                }
                catch (notificationError) {
                    this.logger.error(`❌ Error notifying drivers about booking: ${notificationError.message}`);
                }
            }
            return savedBooking;
        }
        catch (error) {
            console.error('❌ [BOOKING SERVICE] Error creating booking:', error);
            if (error instanceof Error) {
                console.error('❌ [BOOKING SERVICE] Error message:', error.message);
                console.error('❌ [BOOKING SERVICE] Error stack:', error.stack);
            }
            throw new common_1.BadRequestException('Failed to create booking: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    async getPendingBookings() {
        try {
            return await this.bookingModel
                .find({ status: 'PENDING' })
                .sort({ bookingTime: -1 })
                .populate('userId', 'fullName phoneNumber')
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch pending bookings: ' + error.message);
        }
    }
    async getPendingBookingsForDriver(driverId) {
        try {
            const driver = await this.driverModel.findById(driverId).lean();
            if (!driver) {
                return [];
            }
            const assignedBookings = await this.bookingModel
                .find({
                driverId: driverId,
                status: 'PENDING',
            })
                .populate('userId', 'fullName phoneNumber')
                .sort({ bookingTime: -1 })
                .lean()
                .exec();
            const nearbyBookings = [];
            if (driver.latitude && driver.longitude) {
                const unassignedBookings = await this.bookingModel
                    .find({
                    $or: [
                        { driverId: null },
                        { driverId: { $exists: false } }
                    ],
                    status: 'PENDING',
                    pickupLatitude: { $exists: true, $ne: null },
                    pickupLongitude: { $exists: true, $ne: null },
                })
                    .populate('userId', 'fullName phoneNumber')
                    .sort({ bookingTime: -1 })
                    .lean()
                    .exec();
                unassignedBookings.forEach((booking) => {
                    const distance = (0, geolocation_util_1.calculateDistance)(driver.latitude, driver.longitude, booking.pickupLatitude, booking.pickupLongitude);
                    const rejectedByThisDriver = Array.isArray(booking.rejectedDrivers) && booking.rejectedDrivers.some((id) => id?.toString?.() === driverId);
                    if (distance <= 5 && !rejectedByThisDriver) {
                        nearbyBookings.push(booking);
                    }
                });
            }
            const allBookings = [...assignedBookings, ...nearbyBookings];
            const uniqueBookingMap = new Map();
            allBookings.forEach((booking) => {
                const key = booking._id.toString();
                if (!uniqueBookingMap.has(key)) {
                    uniqueBookingMap.set(key, booking);
                }
            });
            return Array.from(uniqueBookingMap.values()).map((booking) => {
                const user = booking.userId;
                return {
                    rideId: booking._id.toString(),
                    bookingId: booking._id.toString(),
                    customerId: user._id?.toString() || '',
                    customerName: user.fullName || 'Customer',
                    pickupLocation: booking.pickupLocation,
                    dropoffLocation: booking.dropoffLocation,
                    dropLocation: booking.dropoffLocation,
                    pickupLatitude: booking.pickupLatitude,
                    pickupLongitude: booking.pickupLongitude,
                    dropoffLatitude: booking.dropoffLatitude,
                    dropoffLongitude: booking.dropoffLongitude,
                    estimatedDistance: booking.estimatedDistance,
                    estimatedFare: booking.estimatedFare,
                    status: booking.status,
                    bookingTime: booking.bookingTime,
                    isNearbyBooking: !booking.driverId,
                };
            });
        }
        catch (error) {
            this.logger.error(`Error fetching pending bookings for driver ${driverId}:`, error);
            throw new common_1.BadRequestException('Failed to fetch pending bookings: ' + error.message);
        }
    }
    async getUserBookings(userId) {
        try {
            console.log('📚 [BOOKING SERVICE] Fetching bookings for user:', userId);
            const bookings = await this.bookingModel
                .find({ userId })
                .sort({ bookingTime: -1 })
                .populate('driverId', 'fullName phoneNumber profileImage')
                .exec();
            console.log('📚 [BOOKING SERVICE] Found', bookings.length, 'bookings for user:', userId);
            const formatted = bookings.map((b) => {
                const obj = b.toObject ? b.toObject() : b;
                if (!obj.driver && obj.driverId) {
                    obj.driver = {
                        fullName: obj.driverId.fullName,
                        phoneNumber: obj.driverId.phoneNumber,
                        profileImage: obj.driverId.profileImage,
                    };
                }
                return obj;
            });
            return formatted;
        }
        catch (error) {
            console.error('❌ [BOOKING SERVICE] Error fetching user bookings:', error);
            throw new common_1.BadRequestException('Failed to fetch user bookings: ' + error.message);
        }
    }
    async estimateFare(distanceInMeters, durationInSeconds, vehicleId, driverId) {
        try {
            let vehicleData = null;
            if (vehicleId) {
                vehicleData = await this.formatVehicleForBooking(vehicleId);
            }
            else if (driverId) {
                const driverFormatted = await this.formatDriverForBooking(driverId);
                if (driverFormatted?.details?.vehicles && driverFormatted.details.vehicles.length > 0) {
                    vehicleData = { details: { fareStructure: driverFormatted.details.vehicles[0].fareStructure } };
                }
            }
            const fare = this.calculateBookingFare(distanceInMeters, durationInSeconds, vehicleData);
            return {
                estimatedFare: fare,
            };
        }
        catch (error) {
            this.logger.error('Error estimating fare:', error);
            throw new common_1.BadRequestException('Failed to estimate fare: ' + error.message);
        }
    }
    async getUserCurrentBooking(userId) {
        try {
            const booking = await this.bookingModel.findOne({
                userId: userId,
                status: { $in: ['PENDING', 'ACCEPTED', 'DRIVER_ARRIVED', 'IN_PROGRESS'] },
            })
                .sort({ bookingTime: -1 })
                .populate('driverId', 'fullName phoneNumber profileImage')
                .populate('vehicleId', 'make vehicleModel licensePlate vehicleImages')
                .exec();
            if (!booking) {
                return null;
            }
            return {
                ...booking.toObject(),
                rideOtp: booking.rideOtp,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch current booking: ' + error.message);
        }
    }
    async getUserPendingBookings(userId) {
        try {
            return await this.bookingModel
                .find({ userId, status: 'PENDING' })
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch pending bookings: ' + error.message);
        }
    }
    async getBookingById(bookingId) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            return booking;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch booking: ' + error.message);
        }
    }
    async acceptBooking(bookingId, driverId, vehicleId) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (booking.status !== 'PENDING') {
                throw new common_1.BadRequestException('Booking is not in PENDING status');
            }
            booking.status = 'ACCEPTED';
            booking.driverId = driverId;
            booking.vehicleId = vehicleId;
            booking.acceptedTime = new Date();
            if (!booking.driver) {
                const driverData = await this.formatDriverForBooking(driverId, vehicleId);
                if (driverData) {
                    booking.driver = driverData;
                }
            }
            if (!booking.vehicle) {
                const vehicleData = await this.formatVehicleForBooking(vehicleId);
                if (vehicleData) {
                    booking.vehicle = vehicleData;
                }
            }
            const savedBooking = await booking.save();
            try {
                const populated = await this.bookingModel.findById(bookingId).populate('userId', 'fullName email').exec();
                const userEmail = populated?.userId?.email || null;
                const userName = populated?.userId?.fullName || '';
                const driver = await this.driverModel.findById(driverId).lean();
                const driverName = driver?.fullName || 'Driver';
                if (userEmail) {
                    await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'ACCEPTED', savedBooking.toObject());
                }
            }
            catch (emailErr) {
                this.logger.error('Failed to send acceptance email to user', emailErr);
            }
            return this.getBookingForDriver(savedBooking, false);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to accept booking: ' + error.message);
        }
    }
    async driverArrived(bookingId, driverId) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (booking.driverId?.toString() !== driverId) {
                throw new common_1.ForbiddenException('You are not assigned to this booking');
            }
            if (booking.status !== 'ACCEPTED') {
                throw new common_1.BadRequestException('Booking must be ACCEPTED before marking arrival');
            }
            booking.status = 'DRIVER_ARRIVED';
            booking.arrivedTime = new Date();
            const savedBooking = await booking.save();
            return this.getBookingForDriver(savedBooking, false);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to update arrival status: ' + error.message);
        }
    }
    async verifyOtpAndStartRide(bookingId, driverId, otp) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (booking.driverId?.toString() !== driverId) {
                throw new common_1.ForbiddenException('You are not assigned to this booking');
            }
            if (booking.status !== 'DRIVER_ARRIVED') {
                throw new common_1.BadRequestException('You must mark arrival before verifying OTP');
            }
            if (booking.rideOtp !== otp) {
                throw new common_1.BadRequestException('Invalid OTP. Please check with the passenger.');
            }
            booking.otpVerified = true;
            booking.status = 'IN_PROGRESS';
            booking.startTime = new Date();
            const savedBooking = await booking.save();
            const user = await this.userModel.findById(booking.userId).select('fullName phoneNumber').exec();
            return {
                success: true,
                message: 'OTP verified successfully! Booking confirmed. Ride has started.',
                booking: {
                    ...this.getBookingForDriver(savedBooking, true),
                    passengerDetails: {
                        name: user?.fullName || 'Passenger',
                        phone: user?.phoneNumber || '',
                    },
                },
                rideDetails: {
                    status: 'IN_PROGRESS',
                    startTime: savedBooking.startTime,
                    pickupLocation: savedBooking.pickupLocation,
                    dropLocation: savedBooking.dropoffLocation,
                    estimatedDistance: savedBooking.estimatedDistance,
                    estimatedFare: savedBooking.estimatedFare,
                    route: savedBooking.route,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to verify OTP: ' + error.message);
        }
    }
    getBookingForDriver(booking, includeDropLocation) {
        const bookingObj = booking.toObject();
        if (!includeDropLocation) {
            return {
                ...bookingObj,
                dropoffLocation: 'Hidden until ride starts',
                dropoffLatitude: null,
                dropoffLongitude: null,
                destination: null,
                route: null,
                pickupDetails: {
                    address: bookingObj.pickupLocation,
                    latitude: bookingObj.pickupLatitude,
                    longitude: bookingObj.pickupLongitude,
                },
            };
        }
        return {
            ...bookingObj,
            pickupDetails: {
                address: bookingObj.pickupLocation,
                latitude: bookingObj.pickupLatitude,
                longitude: bookingObj.pickupLongitude,
            },
            dropDetails: {
                address: bookingObj.dropoffLocation,
                latitude: bookingObj.dropoffLatitude,
                longitude: bookingObj.dropoffLongitude,
            },
        };
    }
    async startRide(bookingId) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (booking.status !== 'ACCEPTED') {
                throw new common_1.BadRequestException('Booking must be ACCEPTED before starting ride');
            }
            booking.status = 'IN_PROGRESS';
            booking.startTime = new Date();
            return await booking.save();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to start ride: ' + error.message);
        }
    }
    async completeRide(bookingId, driverId) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (driverId && booking.driverId?.toString() !== driverId) {
                throw new common_1.ForbiddenException('You are not assigned to this booking');
            }
            if (booking.status !== 'IN_PROGRESS') {
                throw new common_1.BadRequestException('Ride must be IN_PROGRESS to complete');
            }
            booking.status = 'COMPLETED';
            booking.endTime = new Date();
            booking.isCompleted = true;
            booking.paymentCompleted = true;
            if (booking.startTime) {
                const durationMs = booking.endTime.getTime() - booking.startTime.getTime();
                const durationMinutes = Math.round(durationMs / 60000);
                booking.actualDistance = booking.estimatedDistance;
            }
            const savedBooking = await booking.save();
            return {
                message: 'Ride completed successfully',
                booking: savedBooking,
                summary: {
                    pickupLocation: savedBooking.pickupLocation,
                    dropoffLocation: savedBooking.dropoffLocation,
                    distance: savedBooking.estimatedDistance,
                    fare: savedBooking.estimatedFare,
                    startTime: savedBooking.startTime,
                    endTime: savedBooking.endTime,
                    paymentMethod: savedBooking.paymentMethod,
                    status: savedBooking.status,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to complete ride: ' + error.message);
        }
    }
    async getDriverCurrentBooking(driverId) {
        try {
            const booking = await this.bookingModel.findOne({
                driverId: driverId,
                status: { $in: ['ACCEPTED', 'DRIVER_ARRIVED', 'IN_PROGRESS'] },
            }).exec();
            if (!booking) {
                return null;
            }
            return this.getBookingForDriver(booking, booking.otpVerified);
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch current booking: ' + error.message);
        }
    }
    async getBookingForDriverById(bookingId, driverId) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (booking.driverId?.toString() !== driverId) {
                throw new common_1.ForbiddenException('You are not assigned to this booking');
            }
            return this.getBookingForDriver(booking, booking.otpVerified);
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch booking: ' + error.message);
        }
    }
    async cancelBooking(bookingId, options) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
                throw new common_1.BadRequestException('Cannot cancel COMPLETED or already CANCELLED booking');
            }
            booking.status = 'CANCELLED';
            booking.cancelledAt = new Date();
            if (options?.byDriverId) {
                booking.cancelledBy = 'DRIVER';
                booking.cancelledById = options.byDriverId;
                booking.cancellationReason = options.reason || 'Driver cancelled';
                try {
                    const busyUntil = new Date(Date.now() + 3 * 60 * 1000);
                    await this.driverModel.findByIdAndUpdate(options.byDriverId, { $set: { busyUntil } });
                }
                catch (e) {
                    this.logger?.error?.('Failed to mark driver busy on driver cancel', e);
                }
                try {
                    const populated = await this.bookingModel.findById(bookingId).populate('userId', 'fullName email').exec();
                    const userEmail = populated?.userId?.email || null;
                    const userName = populated?.userId?.fullName || '';
                    const driver = await this.driverModel.findById(options.byDriverId).lean();
                    const driverName = driver?.fullName || 'Driver';
                    if (userEmail) {
                        await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'REJECTED', populated?.toObject?.() || booking?.toObject?.());
                    }
                }
                catch (emailErr) {
                    this.logger?.error('Failed to send cancellation email to user', emailErr);
                }
            }
            else {
                booking.cancelledBy = 'USER';
                booking.cancellationReason = options?.reason || 'Cancelled by user';
            }
            return await booking.save();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to cancel booking: ' + error.message);
        }
    }
    async rateBooking(bookingId, rateBookingDto) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new common_1.NotFoundException('Booking not found');
            }
            if (booking.status !== 'COMPLETED') {
                throw new common_1.BadRequestException('Can only rate COMPLETED bookings');
            }
            booking.userRating = rateBookingDto.rating;
            booking.userReview = rateBookingDto.comment;
            return await booking.save();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to rate booking: ' + error.message);
        }
    }
    async getBookingsByDriver(driverId) {
        try {
            return await this.bookingModel
                .find({
                $or: [
                    { 'driver.id': driverId },
                    { driverId: driverId }
                ]
            })
                .sort({ timestamp: -1 })
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch driver bookings: ' + error.message);
        }
    }
    async getDriverCompletedBookings(driverId) {
        try {
            return await this.bookingModel
                .find({
                $or: [
                    { 'driver.id': driverId },
                    { driverId: driverId }
                ],
                status: 'COMPLETED'
            })
                .sort({ timestamp: -1 })
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch completed bookings: ' + error.message);
        }
    }
    async getDriverActiveBookings(driverId) {
        try {
            return await this.bookingModel
                .find({
                $or: [
                    { 'driver.id': driverId },
                    { driverId: driverId }
                ],
                status: { $in: ['ACCEPTED', 'DRIVER_ARRIVED', 'IN_PROGRESS'] }
            })
                .sort({ timestamp: -1 })
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch active bookings: ' + error.message);
        }
    }
    async getDriverCancelledBookings(driverId) {
        try {
            return await this.bookingModel
                .find({
                $or: [
                    { 'driver.id': driverId },
                    { driverId: driverId }
                ],
                status: 'CANCELLED'
            })
                .sort({ timestamp: -1 })
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch cancelled bookings: ' + error.message);
        }
    }
    async getNearbyDrivers(userId, queryDto, userRole) {
        try {
            const radiusKm = queryDto.radius || 2;
            const geoDrivers = await this.driverModel
                .find({
                isOnline: true,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [queryDto.longitude, queryDto.latitude],
                        },
                        $maxDistance: radiusKm * 1000,
                    },
                },
            })
                .select('-password')
                .lean();
            if (geoDrivers.length > 0) {
                const driversWithVehicles = await Promise.all(geoDrivers.map(async (driver) => {
                    const dLat = driver.location?.coordinates[1];
                    const dLng = driver.location?.coordinates[0];
                    const distance = (0, geolocation_util_1.calculateDistance)(queryDto.latitude, queryDto.longitude, dLat, dLng);
                    const vehicle = await this.vehicleModel
                        .findOne({ driverId: driver._id })
                        .lean();
                    return {
                        ...driver,
                        distance: Number(distance.toFixed(2)),
                        vehicle: vehicle ? {
                            make: vehicle.make,
                            vehicleModel: vehicle.vehicleModel,
                            year: vehicle.year,
                            licensePlate: vehicle.licensePlate,
                            vehicleType: vehicle.vehicleType,
                            seatsNo: vehicle.seatsNo,
                            vehicleImages: vehicle.vehicleImages,
                            fareStructure: vehicle.fareStructure,
                        } : undefined,
                    };
                }));
                return driversWithVehicles;
            }
            const legacyDrivers = await this.driverModel
                .find({
                isOnline: true,
                latitude: { $exists: true, $ne: null },
                longitude: { $exists: true, $ne: null },
            })
                .select('-password')
                .lean();
            const driversWithVehicles = await Promise.all(legacyDrivers
                .map((driver) => {
                const distance = (0, geolocation_util_1.calculateDistance)(queryDto.latitude, queryDto.longitude, driver.latitude, driver.longitude);
                return {
                    ...driver,
                    distance: Number(distance.toFixed(2)),
                };
            })
                .filter((driver) => driver.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance)
                .map(async (driver) => {
                const vehicle = await this.vehicleModel
                    .findOne({ driverId: driver._id })
                    .lean();
                return {
                    ...driver,
                    vehicle: vehicle ? {
                        make: vehicle.make,
                        vehicleModel: vehicle.vehicleModel,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate,
                        vehicleType: vehicle.vehicleType,
                        seatsNo: vehicle.seatsNo,
                        vehicleImages: vehicle.vehicleImages,
                        fareStructure: vehicle.fareStructure,
                    } : undefined,
                };
            }));
            return driversWithVehicles;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch nearby drivers: ' + error.message);
        }
    }
    async getNearbyDriversFlexible(queryDto) {
        try {
            const radiusKm = queryDto.radius || 2;
            const drivers = await this.driverModel
                .find({
                isOnline: true,
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [queryDto.longitude, queryDto.latitude],
                        },
                        $maxDistance: radiusKm * 1000,
                    },
                },
            })
                .select('-password')
                .lean();
            const driversWithVehicles = await Promise.all(drivers.map(async (driver) => {
                const dLat = driver.location?.coordinates[1];
                const dLng = driver.location?.coordinates[0];
                const distance = (0, geolocation_util_1.calculateDistance)(queryDto.latitude, queryDto.longitude, dLat, dLng);
                const vehicle = await this.vehicleModel
                    .findOne({ driverId: driver._id })
                    .lean();
                return {
                    ...driver,
                    distance: Number(distance.toFixed(2)),
                    vehicle: vehicle ? {
                        make: vehicle.make,
                        vehicleModel: vehicle.vehicleModel,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate,
                        vehicleType: vehicle.vehicleType,
                        seatsNo: vehicle.seatsNo,
                        vehicleImages: vehicle.vehicleImages,
                        fareStructure: vehicle.fareStructure,
                    } : undefined,
                };
            }));
            return driversWithVehicles;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch nearby drivers: ' + error.message);
        }
    }
    async findNearestDrivers(pickupLatitude, pickupLongitude, vehicleType) {
        try {
            const drivers = await this.driverModel
                .find({
                isOnline: true,
                latitude: { $exists: true, $ne: null },
                longitude: { $exists: true, $ne: null },
            })
                .select('-password')
                .exec();
            const driverIds = drivers.map(d => d._id.toString());
            const vehicles = await this.vehicleModel
                .find({
                driverId: { $in: driverIds },
                vehicleType: vehicleType,
            })
                .exec();
            const vehicleMap = new Map();
            vehicles.forEach(vehicle => {
                vehicleMap.set(vehicle.driverId.toString(), vehicle);
            });
            const driversWithDistance = drivers
                .filter(driver => {
                const vehicle = vehicleMap.get(driver._id.toString());
                return vehicle && driver.latitude != null && driver.longitude != null;
            })
                .map(driver => {
                const distance = (0, geolocation_util_1.calculateDistance)(pickupLatitude, pickupLongitude, driver.latitude, driver.longitude);
                const vehicle = vehicleMap.get(driver._id.toString());
                return {
                    driverId: driver._id.toString(),
                    driverName: driver.fullName || 'Unknown Driver',
                    vehicleType: vehicle?.vehicleType || vehicleType,
                    vehicleDetails: vehicle ? {
                        vehicleId: vehicle._id.toString(),
                        make: vehicle.make,
                        vehicleModel: vehicle.vehicleModel,
                        year: vehicle.year,
                        licensePlate: vehicle.licensePlate,
                        seatsNo: vehicle.seatsNo,
                        vehicleImages: vehicle.vehicleImages,
                    } : null,
                    distanceFromUser: parseFloat(distance.toFixed(2)),
                    rating: driver.drivingExperience?.averageRating || 4.5,
                    totalTrips: driver.drivingExperience?.totalTripsCompleted || 0,
                    phoneNumber: driver.phoneNumber,
                };
            })
                .sort((a, b) => a.distanceFromUser - b.distanceFromUser)
                .slice(0, 5);
            return {
                drivers: driversWithDistance,
                totalFound: driversWithDistance.length,
                requestedVehicleType: vehicleType,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to find nearest drivers: ' + error.message);
        }
    }
    async acceptRide(rideId, driverId) {
        const ride = await this.bookingModel.findById(rideId);
        if (!ride) {
            throw new common_1.NotFoundException('Ride not found');
        }
        if (ride.status !== 'PENDING') {
            throw new common_1.BadRequestException('Ride is not in PENDING status');
        }
        ride.status = 'ACCEPTED';
        ride.driverId = new this.bookingModel.db.base.Types.ObjectId(driverId);
        if ('updatedAt' in ride) {
            ride.updatedAt = new Date();
        }
        await ride.save();
        this.logger.log(`✅ Driver ${driverId} accepted ride ${rideId}`);
        try {
            const user = await this.userModel.findById(ride.userId).select('email fullName').exec();
            const driver = await this.driverModel.findById(driverId).lean();
            const driverName = driver?.fullName || 'Driver';
            if (user && user.email) {
                await this.mailService.sendDriverResponseEmailToUser(user.email, user.fullName, driverName, 'ACCEPTED', ride.toObject ? ride.toObject() : ride);
            }
        }
        catch (emailErr) {
            this.logger.error(`❌ Failed to send ride accepted email: ${emailErr?.message || emailErr}`);
        }
        return ride;
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(booking_schema_1.Booking.name)),
    __param(1, (0, mongoose_1.InjectModel)(driver_schema_1.Driver.name)),
    __param(2, (0, mongoose_1.InjectModel)(vehicle_schema_1.Vehicle.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        driver_notification_service_1.DriverNotificationService,
        mail_service_1.MailService])
], BookingService);
//# sourceMappingURL=booking.service.js.map
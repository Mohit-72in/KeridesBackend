/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { NearbyDriversQueryDto } from './dto/nearby-drivers-query.dto';
import { calculateDistance, findDriversWithinRadius } from '../common/utils/geolocation.util';
import { calculateFare } from '../common/utils/fare.util';
import { DriverNotificationService } from '../common/services/driver-notification.service';
import { MailService } from '../common/services/mail.service';

// ENV-configurable defaults (override in production via environment)
const DEFAULT_NEARBY_DRIVERS_RADIUS_KM = parseFloat(process.env.NEARBY_DRIVERS_RADIUS_KM || '5');
const NEARBY_DRIVERS_LIMIT = parseInt(process.env.NEARBY_DRIVERS_LIMIT || '10', 10);
const DEFAULT_MINIMUM_FARE = parseFloat(process.env.DEFAULT_MINIMUM_FARE || '50');
const DEFAULT_PER_KM_RATE = parseFloat(process.env.DEFAULT_PER_KM_RATE || '15');
const DEFAULT_WAITING_CHARGE_PER_MIN = parseFloat(process.env.DEFAULT_WAITING_CHARGE_PER_MIN || '1');

@Injectable()
export class BookingService {
    private logger = new Logger('BookingService');

    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private notificationService: DriverNotificationService,
        private mailService: MailService,
    ) {
    }

    /**
     * Calculate fare for a booking based on distance and vehicle's fare structure
     */
    private calculateBookingFare(
        distanceInMeters: number,
        durationInSeconds: number,
        vehicleData?: any,
    ): number {
        const distanceInKm = distanceInMeters / 1000;

        // If vehicle data is provided, use its fare structure
        if (vehicleData?.details?.fareStructure) {
            const fareStructure = vehicleData.details.fareStructure;
            return calculateFare({
                distanceInKm,
                durationInSeconds,
                fareStructure: {
                    minimumFare: fareStructure.minimumFare ?? DEFAULT_MINIMUM_FARE,
                    perKilometerRate: fareStructure.perKilometerRate ?? DEFAULT_PER_KM_RATE,
                    waitingChargePerMinute: fareStructure.waitingChargePerMinute ?? DEFAULT_WAITING_CHARGE_PER_MIN,
                },
                baseFare: 0,
            });
        }

        // Default fare calculation if no vehicle data
        // This ensures consistent pricing even without specific vehicle selected
        return calculateFare({
            distanceInKm,
            durationInSeconds,
            fareStructure: {
                minimumFare: DEFAULT_MINIMUM_FARE,
                perKilometerRate: DEFAULT_PER_KM_RATE,
                waitingChargePerMinute: DEFAULT_WAITING_CHARGE_PER_MIN,
            },
            baseFare: 0,
        });
    }

    /**
     * Generate a random 4-digit OTP
     */
    private generateOtp(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    /**
     * Generate unique booking ID
     */
    private generateBookingId(): string {
        return `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Validate and convert string to ObjectId safely
     */
    private toObjectId(id: string | undefined): Types.ObjectId | undefined {
        if (!id) {
            this.logger.debug(`ℹ️ toObjectId received empty/undefined: ${id}`);
            return undefined;
        }

        try {
            // Check if it's a valid ObjectId format (24-char hex string)
            if (Types.ObjectId.isValid(id)) {
                this.logger.debug(`✅ Valid ObjectId: ${id}`);
                return new Types.ObjectId(id);
            }
            // If not valid, log warning and return undefined
            this.logger.warn(`⚠️ Invalid ObjectId format received: "${id}" (length: ${id.length})`);
            return undefined;
        } catch (error) {
            this.logger.warn(`⚠️ Error converting to ObjectId: "${id}" - ${error.message}`);
            return undefined;
        }
    }

    /**
     * Format driver data for embedding in booking
     */
    private async formatDriverForBooking(driverId: string, vehicleId?: string) {
        try {
            const driver = await this.driverModel.findById(driverId).exec();
            if (!driver) {
                return null;
            }

            // Get driver's vehicles
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
        } catch (error) {
            console.error('Error formatting driver for booking:', error);
            return null;
        }
    }

    /**
     * Format vehicle data for embedding in booking
     */
    private async formatVehicleForBooking(vehicleId: string) {
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
        } catch (error) {
            console.error('Error formatting vehicle for booking:', error);
            return null;
        }
    }

    /**
     * Create a new booking by user (Initial status: pending)
     * Generates OTP for ride verification
     * Now stores for both user and driver
     */
    async createBooking(userId: string, createBookingDto: CreateBookingDto) {
        try {
            console.log('📝 [BOOKING SERVICE] Creating booking for user:', userId);
            console.log('📝 [BOOKING SERVICE] Booking DTO:', JSON.stringify(createBookingDto, null, 2));

            // Generate OTP and booking ID
            const rideOtp = this.generateOtp();
            const bookingId = this.generateBookingId();
            console.log('📝 [BOOKING SERVICE] Generated OTP:', rideOtp);
            console.log('📝 [BOOKING SERVICE] Generated Booking ID:', bookingId);

            // Format driver and vehicle data if provided
            let driverData: any = null;
            let vehicleData: any = null;

            if (createBookingDto.selectedDriverId) {
                driverData = await this.formatDriverForBooking(createBookingDto.selectedDriverId, createBookingDto.selectedVehicleId);
            }

            if (createBookingDto.selectedVehicleId) {
                vehicleData = await this.formatVehicleForBooking(createBookingDto.selectedVehicleId);
            }

            // Calculate fare based on distance and vehicle's fare structure (server-side canonical)
            const calculatedFare = this.calculateBookingFare(
                createBookingDto.distance.value,
                createBookingDto.duration.value,
                vehicleData,
            );

            // Prefer client-provided estimated fare if available (this is the price shown to user when selecting driver)
            const providedTotal = createBookingDto.price?.total;
            const finalTotal = typeof providedTotal === 'number' && providedTotal > 0 ? providedTotal : calculatedFare;

            // Map DTO fields to schema fields
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
                confirmationStatus: 'PENDING_DRIVER', // Waiting for driver acceptance
                rideOtp: rideOtp,
                otpVerified: false,
                paymentMethod: createBookingDto.paymentMethod?.toUpperCase() || 'CASH',
                paymentCompleted: false,
                userNotes: createBookingDto.userNotes || '',
                vehiclePreference: createBookingDto.vehiclePreference,
                passengers: createBookingDto.passengers || 1,
                timestamp: new Date(),
                // Initialize status history
                statusHistory: [
                    {
                        status: 'PENDING',
                        confirmationStatus: 'PENDING_DRIVER',
                        timestamp: new Date(),
                        notes: 'Booking created - waiting for driver acceptance',
                        changedBy: 'SYSTEM',
                    },
                ],
                // Legacy fields for backward compatibility - Convert to ObjectId safely
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

            // Prepare booking data for notification
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

            // Step 2: Handle driver notification
            if (createBookingDto.selectedDriverId) {
                // Case 1: Specific driver was selected - send notification to that specific driver
                this.logger.log(`🎯 [BOOKING SERVICE] User booked specific driver: ${createBookingDto.selectedDriverId}`);

                try {
                    const success = this.notificationService.notifyDriver(
                        createBookingDto.selectedDriverId,
                        bookingNotificationData,
                    );

                    if (success) {
                        this.logger.log(`✅ Notification sent to specific driver ${createBookingDto.selectedDriverId}`);
                    } else {
                        this.logger.warn(`⚠️ Specific driver ${createBookingDto.selectedDriverId} is not connected to SSE. They will see the booking when they poll the endpoint.`);
                    }

                    // Also send an email to the driver informing them that a user has selected them
                    try {
                        const driverEmail = driverData?.details?.email;
                        const driverName = driverData?.details?.name;
                        if (driverEmail) {
                            await this.mailService.sendDriverAssignedEmail(driverEmail, driverName, savedBooking.toObject());
                        }
                    } catch (emailErr) {
                        this.logger.error(`❌ Failed to send assigned-driver email: ${emailErr?.message || emailErr}`);
                    }
                } catch (notificationError) {
                    this.logger.error(`❌ Error notifying specific driver: ${notificationError.message}`);
                    // Don't throw error - booking should still be created even if notification fails
                }
            } else {
                // Case 2: No driver selected - find and notify nearby drivers
                this.logger.log(`🔔 [BOOKING SERVICE] No driver selected. Finding nearby drivers for booking ${savedBooking.bookingId}`);

                try {
                    const pickupLat = createBookingDto.origin.location.lat;
                    const pickupLng = createBookingDto.origin.location.lng;

                    // Find all online drivers within 5 KM radius
                    const allOnlineDrivers = await this.driverModel.find({
                        isOnline: true,
                        latitude: { $exists: true, $ne: null },
                        longitude: { $exists: true, $ne: null },
                    }).lean();

                    const nearbyDrivers = findDriversWithinRadius(
                        pickupLat,
                        pickupLng,
                        allOnlineDrivers,
                        DEFAULT_NEARBY_DRIVERS_RADIUS_KM,
                    );

                    this.logger.log(`🔍 Found ${nearbyDrivers.length} drivers within 5 KM radius`);

                    // Send SSE notifications to connected drivers
                    if (nearbyDrivers.length > 0) {
                        // Notify each nearby driver individually so we can include driver-specific data
                        let sent = 0;
                        let failed = 0;

                        for (const driver of nearbyDrivers) {
                            try {
                                // Skip drivers temporarily marked busy
                                if (driver.busyUntil && new Date(driver.busyUntil) > new Date()) {
                                    this.logger.log(`⚠️ Skipping busy driver ${driver._id} (busy until ${driver.busyUntil})`);
                                    failed++;
                                    continue;
                                }

                                // Skip drivers who already rejected this booking
                                if (Array.isArray(savedBooking.rejectedDrivers) && savedBooking.rejectedDrivers.some((id: any) => id?.toString?.() === driver._id.toString())) {
                                    this.logger.log(`⚠️ Skipping driver ${driver._id} who already rejected booking ${savedBooking.bookingId}`);
                                    failed++;
                                    continue;
                                }

                                // Estimate fare for this specific driver (driver's vehicle fare structure may differ)
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
                                } else {
                                    failed++;
                                }
                            } catch (err) {
                                this.logger.error(`❌ Error notifying driver ${driver._id}: ${err?.message || err}`);
                                failed++;
                            }
                        }

                        this.logger.log(`✅ SSE Notifications sent: ${sent} drivers notified, ${failed} not connected or skipped`);

                        if (failed > 0) {
                            this.logger.warn(`⚠️ ${failed} drivers were not connected or were skipped. They will still see the booking when they poll the endpoint.`);
                        }
                    } else {
                        this.logger.warn(`⚠️ No online drivers found within 5 KM radius for booking ${savedBooking.bookingId}`);
                    }
                } catch (notificationError) {
                    this.logger.error(`❌ Error notifying drivers about booking: ${notificationError.message}`);
                    // Don't throw error - booking should still be created even if notification fails
                }
            }

            return savedBooking;
        } catch (error) {
            console.error('❌ [BOOKING SERVICE] Error creating booking:', error);
            if (error instanceof Error) {
                console.error('❌ [BOOKING SERVICE] Error message:', error.message);
                console.error('❌ [BOOKING SERVICE] Error stack:', error.stack);
            }
            throw new BadRequestException('Failed to create booking: ' + (error instanceof Error ? error.message : String(error)));
        }
    }

    /**
     * Get all pending bookings for drivers to view
     */
    async getPendingBookings() {
        try {
            return await this.bookingModel
                .find({ status: 'PENDING' })
                .sort({ bookingTime: -1 })
                .populate('userId', 'fullName phoneNumber')
                .exec();
        } catch (error) {
            throw new BadRequestException('Failed to fetch pending bookings: ' + error.message);
        }
    }

    /**
     * Get pending bookings assigned to a specific driver
     * Used by driver to see incoming ride requests via REST API polling
     * Now also includes nearby unassigned bookings within 5 KM radius
     */
    async getPendingBookingsForDriver(driverId: string) {
        try {
            const driver = await this.driverModel.findById(driverId).lean();

            if (!driver) {
                return [];
            }

            // Get bookings explicitly assigned to this driver
            const assignedBookings = await this.bookingModel
                .find({
                    driverId: driverId,
                    status: 'PENDING',
                })
                .populate('userId', 'fullName phoneNumber')
                .sort({ bookingTime: -1 })
                .lean()
                .exec();

            // Get nearby unassigned bookings (within 5 KM) if driver has location
            const nearbyBookings: any[] = [];
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

                // Filter by distance (5 KM radius) AND exclude bookings this driver already rejected
                unassignedBookings.forEach((booking: any) => {
                    const distance = calculateDistance(
                        driver.latitude!,
                        driver.longitude!,
                        booking.pickupLatitude!,
                        booking.pickupLongitude!,
                    );

                    const rejectedByThisDriver = Array.isArray(booking.rejectedDrivers) && booking.rejectedDrivers.some((id: any) => id?.toString?.() === driverId);

                    if (distance <= 5 && !rejectedByThisDriver) {
                        nearbyBookings.push(booking);
                    }
                });
            }

            // Combine and deduplicate
            const allBookings = [...assignedBookings, ...nearbyBookings];
            const uniqueBookingMap = new Map();

            allBookings.forEach((booking: any) => {
                const key = booking._id.toString();
                if (!uniqueBookingMap.has(key)) {
                    uniqueBookingMap.set(key, booking);
                }
            });

            return Array.from(uniqueBookingMap.values()).map((booking: any) => {
                // Type guard: userId is populated
                const user = booking.userId as any;
                return {
                    rideId: booking._id.toString(),
                    bookingId: booking._id.toString(),
                    customerId: user._id?.toString() || '',
                    customerName: user.fullName || 'Customer',
                    pickupLocation: booking.pickupLocation,
                    dropoffLocation: booking.dropoffLocation,
                    dropLocation: booking.dropoffLocation, // Alias for compatibility
                    pickupLatitude: booking.pickupLatitude,
                    pickupLongitude: booking.pickupLongitude,
                    dropoffLatitude: booking.dropoffLatitude,
                    dropoffLongitude: booking.dropoffLongitude,
                    estimatedDistance: booking.estimatedDistance,
                    estimatedFare: booking.estimatedFare,
                    status: booking.status,
                    bookingTime: booking.bookingTime,
                    isNearbyBooking: !booking.driverId, // Flag to indicate if this is a nearby unassigned booking
                };
            });
        } catch (error) {
            this.logger.error(`Error fetching pending bookings for driver ${driverId}:`, error);
            throw new BadRequestException('Failed to fetch pending bookings: ' + error.message);
        }
    }

    /**
     * Get user's bookings with status
     */
    async getUserBookings(userId: string) {
        try {
            console.log('📚 [BOOKING SERVICE] Fetching bookings for user:', userId);

            const bookings = await this.bookingModel
                .find({ userId })
                .sort({ bookingTime: -1 })
                .populate('driverId', 'fullName phoneNumber profileImage')
                .exec();

            console.log('📚 [BOOKING SERVICE] Found', bookings.length, 'bookings for user:', userId);

            // If driver data isn't embedded, attach populated driver info for frontend consumption
            const formatted = bookings.map((b: any) => {
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
        } catch (error) {
            console.error('❌ [BOOKING SERVICE] Error fetching user bookings:', error);
            throw new BadRequestException('Failed to fetch user bookings: ' + error.message);
        }
    }

    /**
     * Estimate fare for a hypothetical trip using server-side fare logic
     */
    async estimateFare(distanceInMeters: number, durationInSeconds: number, vehicleId?: string, driverId?: string) {
        try {
            let vehicleData: any = null;

            if (vehicleId) {
                vehicleData = await this.formatVehicleForBooking(vehicleId);
            } else if (driverId) {
                const driverFormatted = await this.formatDriverForBooking(driverId);
                // choose first vehicle if available
                if (driverFormatted?.details?.vehicles && driverFormatted.details.vehicles.length > 0) {
                    vehicleData = { details: { fareStructure: driverFormatted.details.vehicles[0].fareStructure } };
                }
            }

            const fare = this.calculateBookingFare(distanceInMeters, durationInSeconds, vehicleData);
            // also use calculateFareWithBreakdown if needed for more details
            return {
                estimatedFare: fare,
            };
        } catch (error) {
            this.logger.error('Error estimating fare:', error);
            throw new BadRequestException('Failed to estimate fare: ' + error.message);
        }
    }

    /**
     * Get user's current active booking with OTP (for sharing with driver)
     */
    async getUserCurrentBooking(userId: string) {
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

            // Return booking with OTP visible to user (they share it with driver)
            return {
                ...booking.toObject(),
                // OTP is visible to user so they can share with driver when driver arrives
                rideOtp: booking.rideOtp,
            };
        } catch (error) {
            throw new BadRequestException('Failed to fetch current booking: ' + error.message);
        }
    }

    /**
     * Get user's pending bookings only
     */
    async getUserPendingBookings(userId: string) {
        try {
            return await this.bookingModel
                .find({ userId, status: 'PENDING' })
                .exec();
        } catch (error) {
            throw new BadRequestException('Failed to fetch pending bookings: ' + error.message);
        }
    }

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }
            return booking;
        } catch (error) {
            throw new BadRequestException('Failed to fetch booking: ' + error.message);
        }
    }

    /**
     * Driver accepts booking - changes status from pending to accepted
     * Driver can only see pickup location at this point
     * Now also stores driver and vehicle details in booking for history
     */
    async acceptBooking(bookingId: string, driverId: string, vehicleId: string) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.status !== 'PENDING') {
                throw new BadRequestException('Booking is not in PENDING status');
            }

            booking.status = 'ACCEPTED';
            booking.driverId = driverId as any;
            booking.vehicleId = vehicleId as any;
            booking.acceptedTime = new Date();

            // Store driver and vehicle details if not already stored
            if (!booking.driver) {
                const driverData = await this.formatDriverForBooking(driverId, vehicleId);
                if (driverData) {
                    booking.driver = driverData as any;
                }
            }

            if (!booking.vehicle) {
                const vehicleData = await this.formatVehicleForBooking(vehicleId);
                if (vehicleData) {
                    booking.vehicle = vehicleData as any;
                }
            }

            const savedBooking = await booking.save();

            // Notify user by email about acceptance
            try {
                const populated = await this.bookingModel.findById(bookingId).populate('userId', 'fullName email').exec();
                const userEmail = (populated?.userId as any)?.email || null;
                const userName = (populated?.userId as any)?.fullName || '';
                const driver = await this.driverModel.findById(driverId).lean();
                const driverName = driver?.fullName || 'Driver';
                if (userEmail) {
                    await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'ACCEPTED', savedBooking.toObject());
                }
            } catch (emailErr) {
                this.logger.error('Failed to send acceptance email to user', emailErr);
            }

            // Return booking with ONLY pickup location (drop location hidden)
            return this.getBookingForDriver(savedBooking, false);
        } catch (error) {
            throw new BadRequestException('Failed to accept booking: ' + error.message);
        }
    }

    /**
     * Driver marks arrival at pickup location
     */
    async driverArrived(bookingId: string, driverId: string) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.driverId?.toString() !== driverId) {
                throw new ForbiddenException('You are not assigned to this booking');
            }

            if (booking.status !== 'ACCEPTED') {
                throw new BadRequestException('Booking must be ACCEPTED before marking arrival');
            }

            booking.status = 'DRIVER_ARRIVED';
            booking.arrivedTime = new Date();

            const savedBooking = await booking.save();

            // Still return without drop location - waiting for OTP
            return this.getBookingForDriver(savedBooking, false);
        } catch (error) {
            throw new BadRequestException('Failed to update arrival status: ' + error.message);
        }
    }

    /**
     * Driver verifies OTP from user - this reveals drop location and starts the ride
     * When OTP matches successfully, booking is confirmed and ride begins
     */
    async verifyOtpAndStartRide(bookingId: string, driverId: string, otp: string) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.driverId?.toString() !== driverId) {
                throw new ForbiddenException('You are not assigned to this booking');
            }

            if (booking.status !== 'DRIVER_ARRIVED') {
                throw new BadRequestException('You must mark arrival before verifying OTP');
            }

            // Verify OTP
            if (booking.rideOtp !== otp) {
                throw new BadRequestException('Invalid OTP. Please check with the passenger.');
            }

            // OTP verified successfully - Booking is now confirmed!
            booking.otpVerified = true;
            booking.status = 'IN_PROGRESS';
            booking.startTime = new Date();

            const savedBooking = await booking.save();

            // Get user details for the response
            const user = await this.userModel.findById(booking.userId).select('fullName phoneNumber').exec();

            // Return success response with full booking details including drop location
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
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ForbiddenException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to verify OTP: ' + error.message);
        }
    }

    /**
     * Helper: Get booking data for driver (with or without drop location)
     */
    private getBookingForDriver(booking: BookingDocument, includeDropLocation: boolean) {
        const bookingObj = booking.toObject();

        if (!includeDropLocation) {
            // Hide drop location details until OTP verified
            return {
                ...bookingObj,
                dropoffLocation: 'Hidden until ride starts',
                dropoffLatitude: null,
                dropoffLongitude: null,
                destination: null,
                route: null,
                // Include pickup details
                pickupDetails: {
                    address: bookingObj.pickupLocation,
                    latitude: bookingObj.pickupLatitude,
                    longitude: bookingObj.pickupLongitude,
                },
            };
        }

        // Full booking with drop location
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

    /**
     * Start ride - changes status to in-progress (DEPRECATED - use verifyOtpAndStartRide)
     */
    async startRide(bookingId: string) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.status !== 'ACCEPTED') {
                throw new BadRequestException('Booking must be ACCEPTED before starting ride');
            }

            booking.status = 'IN_PROGRESS';
            booking.startTime = new Date();
            return await booking.save();
        } catch (error) {
            throw new BadRequestException('Failed to start ride: ' + error.message);
        }
    }

    /**
     * Complete ride - changes status to completed (driver marks journey as done)
     */
    async completeRide(bookingId: string, driverId?: string) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            // Verify driver owns this booking if driverId provided
            if (driverId && booking.driverId?.toString() !== driverId) {
                throw new ForbiddenException('You are not assigned to this booking');
            }

            if (booking.status !== 'IN_PROGRESS') {
                throw new BadRequestException('Ride must be IN_PROGRESS to complete');
            }

            booking.status = 'COMPLETED';
            booking.endTime = new Date();
            booking.isCompleted = true;
            booking.paymentCompleted = true; // Mark payment as done

            // Calculate actual duration
            if (booking.startTime) {
                const durationMs = booking.endTime.getTime() - booking.startTime.getTime();
                const durationMinutes = Math.round(durationMs / 60000);
                booking.actualDistance = booking.estimatedDistance; // Could be updated with actual GPS tracking
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
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to complete ride: ' + error.message);
        }
    }

    /**
     * Get driver's current active booking (ACCEPTED, DRIVER_ARRIVED, or IN_PROGRESS)
     */
    async getDriverCurrentBooking(driverId: string) {
        try {
            const booking = await this.bookingModel.findOne({
                driverId: driverId,
                status: { $in: ['ACCEPTED', 'DRIVER_ARRIVED', 'IN_PROGRESS'] },
            }).exec();

            if (!booking) {
                return null;
            }

            // Return with appropriate data based on OTP verification status
            return this.getBookingForDriver(booking, booking.otpVerified);
        } catch (error) {
            throw new BadRequestException('Failed to fetch current booking: ' + error.message);
        }
    }

    /**
     * Get booking details for driver (respects OTP verification)
     */
    async getBookingForDriverById(bookingId: string, driverId: string) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.driverId?.toString() !== driverId) {
                throw new ForbiddenException('You are not assigned to this booking');
            }

            // Return with appropriate data based on OTP verification status
            return this.getBookingForDriver(booking, booking.otpVerified);
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to fetch booking: ' + error.message);
        }
    }

    /**
     * Cancel booking
     */
    async cancelBooking(bookingId: string, options?: { byDriverId?: string; reason?: string }) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
                throw new BadRequestException('Cannot cancel COMPLETED or already CANCELLED booking');
            }

            booking.status = 'CANCELLED';
            booking.cancelledAt = new Date();

            if (options?.byDriverId) {
                booking.cancelledBy = 'DRIVER';
                booking.cancelledById = options.byDriverId as any;
                booking.cancellationReason = options.reason || 'Driver cancelled';

                // Mark the driver busy for short period
                try {
                    const busyUntil = new Date(Date.now() + 3 * 60 * 1000);
                    await this.driverModel.findByIdAndUpdate(options.byDriverId, { $set: { busyUntil } });
                } catch (e) {
                    this.logger?.error?.('Failed to mark driver busy on driver cancel', e);
                }

                // Notify user by email that driver cancelled
                try {
                    const populated = await this.bookingModel.findById(bookingId).populate('userId', 'fullName email').exec();
                    const userEmail = (populated?.userId as any)?.email || null;
                    const userName = (populated?.userId as any)?.fullName || '';
                    const driver = await this.driverModel.findById(options.byDriverId).lean();
                    const driverName = driver?.fullName || 'Driver';
                    if (userEmail) {
                        await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'REJECTED', populated?.toObject?.() || booking?.toObject?.());
                    }
                } catch (emailErr) {
                    this.logger?.error('Failed to send cancellation email to user', emailErr);
                }
            } else {
                booking.cancelledBy = 'USER';
                booking.cancellationReason = options?.reason || 'Cancelled by user';
            }

            return await booking.save();
        } catch (error) {
            throw new BadRequestException('Failed to cancel booking: ' + error.message);
        }
    }

    /**
     * Rate booking and provide feedback
     */
    async rateBooking(bookingId: string, rateBookingDto: RateBookingDto) {
        try {
            const booking = await this.bookingModel.findById(bookingId).exec();
            if (!booking) {
                throw new NotFoundException('Booking not found');
            }

            if (booking.status !== 'COMPLETED') {
                throw new BadRequestException('Can only rate COMPLETED bookings');
            }

            booking.userRating = rateBookingDto.rating;
            booking.userReview = rateBookingDto.comment;

            return await booking.save();
        } catch (error) {
            throw new BadRequestException('Failed to rate booking: ' + error.message);
        }
    }

    /**
     * Get bookings by driver (with full driver and vehicle details)
     */
    async getBookingsByDriver(driverId: string) {
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
        } catch (error) {
            throw new BadRequestException('Failed to fetch driver bookings: ' + error.message);
        }
    }

    /**
     * Get all completed bookings for a driver
     */
    async getDriverCompletedBookings(driverId: string) {
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
        } catch (error) {
            throw new BadRequestException('Failed to fetch completed bookings: ' + error.message);
        }
    }

    /**
     * Get all active/ongoing bookings for a driver
     */
    async getDriverActiveBookings(driverId: string) {
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
        } catch (error) {
            throw new BadRequestException('Failed to fetch active bookings: ' + error.message);
        }
    }

    /**
     * Get all cancelled bookings for a driver
     */
    async getDriverCancelledBookings(driverId: string) {
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
        } catch (error) {
            throw new BadRequestException('Failed to fetch cancelled bookings: ' + error.message);
        }
    }

    /**
     * Get nearby available drivers within specified radius from user location
     * Filters by matching operating area if both user and drivers have it set
     * If operating area is not set or empty, shows all online drivers in radius
     */
    // ================== START GEO FIX ==================
    async getNearbyDrivers(
        userId: string,
        queryDto: NearbyDriversQueryDto,
        userRole: string,
    ) {
        try {
            const radiusKm = queryDto.radius || 2;

            // 1️⃣ PRIMARY: GeoJSON based search
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
                // Fetch vehicles for drivers and attach to driver data
                const driversWithVehicles = await Promise.all(
                    geoDrivers.map(async (driver: any) => {
                        const dLat = driver.location?.coordinates[1];
                        const dLng = driver.location?.coordinates[0];
                        const distance = calculateDistance(
                            queryDto.latitude,
                            queryDto.longitude,
                            dLat,
                            dLng,
                        );

                        // Fetch the driver's first vehicle
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
                    })
                );
                return driversWithVehicles;
            }

            // 2️⃣ FALLBACK: old latitude/longitude logic (SAFE)
            const legacyDrivers = await this.driverModel
                .find({
                    isOnline: true,
                    latitude: { $exists: true, $ne: null },
                    longitude: { $exists: true, $ne: null },
                })
                .select('-password')
                .lean();

            const driversWithVehicles = await Promise.all(
                legacyDrivers
                    .map((driver: any) => {
                        const distance = calculateDistance(
                            queryDto.latitude,
                            queryDto.longitude,
                            driver.latitude!,
                            driver.longitude!,
                        );
                        return {
                            ...driver,
                            distance: Number(distance.toFixed(2)),
                        };
                    })
                    .filter((driver: any) => driver.distance <= radiusKm)
                    .sort((a: any, b: any) => a.distance - b.distance)
                    .map(async (driver: any) => {
                        // Fetch the driver's first vehicle
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
                    })
            );

            return driversWithVehicles;
        } catch (error) {
            throw new BadRequestException(
                'Failed to fetch nearby drivers: ' + error.message,
            );
        }
    }
    // ================== END GEO FIX ==================

    /**
     * Get nearby available drivers without operating area restriction
     * Useful for testing or when operating area filtering is not desired
     */
    // ================== START GEO FIX ==================
    async getNearbyDriversFlexible(queryDto: NearbyDriversQueryDto) {
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

            // Fetch vehicles for drivers and attach to driver data
            const driversWithVehicles = await Promise.all(
                drivers.map(async (driver: any) => {
                    const dLat = driver.location?.coordinates[1];
                    const dLng = driver.location?.coordinates[0];
                    const distance = calculateDistance(
                        queryDto.latitude,
                        queryDto.longitude,
                        dLat,
                        dLng,
                    );

                    // Fetch the driver's first vehicle
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
                })
            );

            return driversWithVehicles;
        } catch (error) {
            throw new BadRequestException(
                'Failed to fetch nearby drivers: ' + error.message,
            );
        }
    }
    // ================== END GEO FIX ==================

    /**
     * Find nearest 5 drivers matching vehicle type from pickup location
     */
    async findNearestDrivers(
        pickupLatitude: number,
        pickupLongitude: number,
        vehicleType: string,
    ) {
        try {
            // Get all online drivers with location data and matching vehicle type
            const drivers = await this.driverModel
                .find({
                    isOnline: true,
                    latitude: { $exists: true, $ne: null },
                    longitude: { $exists: true, $ne: null },
                })
                .select('-password')
                .exec();

            // Get vehicles for the drivers
            const driverIds = drivers.map(d => d._id.toString());
            const vehicles = await this.vehicleModel
                .find({
                    driverId: { $in: driverIds },
                    vehicleType: vehicleType,
                })
                .exec();

            // Create map for quick vehicle lookup
            const vehicleMap = new Map();
            vehicles.forEach(vehicle => {
                vehicleMap.set(vehicle.driverId.toString(), vehicle);
            });

            // Calculate distance for each driver with matching vehicle type
            const driversWithDistance = drivers
                .filter(driver => {
                    const vehicle = vehicleMap.get(driver._id.toString());
                    return vehicle && driver.latitude != null && driver.longitude != null;
                })
                .map(driver => {
                    const distance = calculateDistance(
                        pickupLatitude,
                        pickupLongitude,
                        driver.latitude!,
                        driver.longitude!,
                    );
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
                .slice(0, 5); // Return top 5 nearest drivers

            return {
                drivers: driversWithDistance,
                totalFound: driversWithDistance.length,
                requestedVehicleType: vehicleType,
            };
        } catch (error) {
            throw new BadRequestException('Failed to find nearest drivers: ' + error.message);
        }
    }

    async acceptRide(rideId: string, driverId: string) {
        // Only handle request/response, no socket usage
        const ride = await this.bookingModel.findById(rideId);
        if (!ride) {
            throw new NotFoundException('Ride not found');
        }

        if (ride.status !== 'PENDING') {
            throw new BadRequestException('Ride is not in PENDING status');
        }

        ride.status = 'ACCEPTED';
        ride.driverId = new (this.bookingModel as any).db.base.Types.ObjectId(driverId);
        if ('updatedAt' in ride) {
            (ride as any).updatedAt = new Date(); // ensure ETag/Last-Modified changes
        }
        await ride.save();

        this.logger.log(`✅ Driver ${driverId} accepted ride ${rideId}`);

        // No socket usage here

        // Notify user by email only
        try {
            const user = await this.userModel.findById(ride.userId).select('email fullName').exec();
            const driver = await this.driverModel.findById(driverId).lean();
            const driverName = driver?.fullName || 'Driver';
            if (user && user.email) {
                await this.mailService.sendDriverResponseEmailToUser(
                    user.email,
                    user.fullName,
                    driverName,
                    'ACCEPTED',
                    ride.toObject ? ride.toObject() : ride
                );
            }
        } catch (emailErr) {
            this.logger.error(`❌ Failed to send ride accepted email: ${emailErr?.message || emailErr}`);
        }

        // Return the updated ride as response
        return ride;
    }
}


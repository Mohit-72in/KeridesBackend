/* eslint-disable prettier/prettier */
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import { Vehicle, VehicleDocument } from '../schemas/vehicle.schema';
import { calculateDistance, findDriversWithinRadius } from '../common/utils/geolocation.util';
import { calculateFare } from '../common/utils/fare.util';
import { MailService } from '../common/services/mail.service';

export interface RideRequest {
    bookingId: string;
    customerId: string;
    customerName: string;
    customerPhone?: string;
    pickupLocation: string | undefined;
    dropoffLocation: string | undefined;
    pickupLatitude: number;
    pickupLongitude: number;
    estimatedFare: number;
    estimatedDistance?: number;
    status: string;
}

@Injectable()
export class RideService {
    private logger = new Logger('RideService');

    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        private mailService: MailService,
    ) { }

    /**
     * Create a new ride/booking and find nearby drivers
     * This replaces the socket-based ride_request event
     */
    async createRideAndNotifyDrivers(
        customerId: string,
        pickupLat: number,
        pickupLng: number,
        dropoffLat: number,
        dropoffLng: number,
        pickupAddress: string,
        dropoffAddress: string,
        estimatedFare: number,
    ) {
        try {
            // Step 1: Create booking in database
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

            // Step 2: Find online drivers within 2 KM radius
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

            const nearbyDrivers = findDriversWithinRadius(
                pickupLat,
                pickupLng,
                allOnlineDrivers,
                2, // 2 KM radius
            );

            this.logger.log(
                `🔍 Found ${nearbyDrivers.length} drivers within 2 KM radius`,
            );

            // Step 3: Create ride requests for each nearby driver
            // These will be fetched via polling API
            const rideRequests = nearbyDrivers.map((driver) => ({
                bookingId: savedBooking._id.toString(),
                driverId: driver._id.toString(),
                status: 'PENDING',
                createdAt: new Date(),
            }));

            // Set booking expiry to 3 minutes and schedule auto-cancel
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

                            // Mark drivers who rejected as busy for 3 minutes
                            if (Array.isArray(fresh.rejectedDrivers) && fresh.rejectedDrivers.length > 0) {
                                const busyUntil = new Date(Date.now() + 3 * 60 * 1000);
                                await this.driverModel.updateMany(
                                    { _id: { $in: fresh.rejectedDrivers } },
                                    { $set: { busyUntil } },
                                );
                            }
                        }
                    } catch (e) {
                        this.logger.error('Error during auto-cancel timeout handling', e);
                    }
                }, 3 * 60 * 1000);
            } catch (err) {
                this.logger.error('Error scheduling booking expiry', err);
            }

            // Store in ride_requests collection (create if needed)
            // For now, we'll return the ride details

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
        } catch (error) {
            this.logger.error('Error creating ride:', error);
            throw new BadRequestException('Failed to create ride: ' + error.message);
        }
    }

    /**
     * Get pending ride requests for a specific driver
     * This replaces the socket-based new_ride_request event
     * Drivers poll this API every 5-10 seconds
     */
    async getPendingRidesForDriver(driverId: string): Promise<RideRequest[]> {
        try {
            // Find all pending bookings where no driver is assigned yet
            // AND driver is within 2 KM of pickup location
            const _driverQuery: any = this.driverModel.findById(driverId);
            const driver = (_driverQuery && typeof _driverQuery.lean === 'function')
                ? await _driverQuery.lean()
                : await _driverQuery;

            if (!driver || !driver.latitude || !driver.longitude) {
                return [];
            }

            // Query all pending bookings and include customer phone
            const pendingBookings = await this.bookingModel
                .find({ status: 'PENDING' })
                .populate('userId', 'fullName phoneNumber')
                .lean();

            // Get driver's default vehicle fareStructure (if any)
            const _vehicleQuery: any = this.vehicleModel.findOne({ driverId });
            const driverVehicle = (_vehicleQuery && typeof _vehicleQuery.lean === 'function')
                ? await _vehicleQuery.lean()
                : await _vehicleQuery;
            const driverFareStructure = driverVehicle?.fareStructure || null;

            // Filter bookings where driver is within 2 KM and exclude bookings this driver already rejected
            const availableRides = pendingBookings
                .filter((booking) => {
                    // Type guard for coordinates
                    if (!booking.pickupLatitude || !booking.pickupLongitude) {
                        return false;
                    }

                    // If booking is explicitly assigned to another driver, skip it
                    if (booking.driverId && booking.driverId.toString() !== driverId) {
                        return false;
                    }

                    // Exclude bookings rejected by this driver
                    const rejectedByThisDriver = Array.isArray(booking.rejectedDrivers) && booking.rejectedDrivers.some((id: any) => id?.toString?.() === driverId);
                    if (rejectedByThisDriver) return false;

                    const distance = calculateDistance(
                        driver.latitude!,
                        driver.longitude!,
                        booking.pickupLatitude,
                        booking.pickupLongitude,
                    );
                    return distance <= 2; // 2 KM radius
                })
                .map((booking) => {
                    // Compute per-driver estimated fare using driver's fare structure if available
                    let estimatedFare = booking.estimatedFare || 0;
                    const distanceInKm = (booking.distance?.value || 0) / 1000;
                    const durationInSeconds = booking.duration?.value || 0;

                    if (driverFareStructure) {
                        try {
                            estimatedFare = calculateFare({
                                distanceInKm,
                                durationInSeconds,
                                fareStructure: {
                                    minimumFare: driverFareStructure.minimumFare || 0,
                                    perKilometerRate: driverFareStructure.perKilometerRate || 0,
                                    waitingChargePerMinute: driverFareStructure.waitingChargePerMinute || 0,
                                },
                                baseFare: 0,
                            });
                        } catch (e) {
                            // keep fallback
                        }
                    }

                    return {
                        bookingId: booking._id.toString(),
                        customerId: (booking.userId as any)?._id?.toString() || booking.userId?.toString?.(),
                        customerName: (booking.userId as any).fullName || 'Customer',
                        customerPhone: (booking.userId as any).phoneNumber || 'N/A',
                        pickupLocation: booking.pickupLocation,
                        dropoffLocation: booking.dropoffLocation,
                        pickupLatitude: booking.pickupLatitude!,
                        pickupLongitude: booking.pickupLongitude!,
                        estimatedFare: estimatedFare,
                        estimatedDistance: booking.estimatedDistance || (booking.distance?.value ? booking.distance.value / 1000 : undefined),
                        status: booking.status,
                    };
                });

            return availableRides;
        } catch (error) {
            this.logger.error('Error fetching pending rides for driver:', error);
            return [];
        }
    }

    /**
     * Driver accepts a ride
     * Updates booking status and assigns driver
     */
    async acceptRide(bookingId: string, driverId: string) {
        try {
            // Check if booking still exists and is PENDING
            const booking = await this.bookingModel.findById(bookingId);

            if (!booking) {
                throw new BadRequestException('Booking not found');
            }

            if (booking.status !== 'PENDING') {
                throw new BadRequestException(
                    `Booking is no longer available (status: ${booking.status})`,
                );
            }

            // Update booking: assign driver and change status
            booking.driverId = new Types.ObjectId(driverId);
            booking.status = 'ACCEPTED';
            booking.acceptedTime = new Date();

            const updatedBooking = await booking.save();
            this.logger.log(
                `✅ Driver ${driverId} accepted ride ${bookingId}`,
            );

            // Notify user by email about acceptance
            try {
                const user = await (this.bookingModel.findById(bookingId).populate('userId', 'fullName email') as any).exec();
                const userEmail = (user?.userId as any)?.email || (user?.userId as any)?.phone || null;
                const userName = (user?.userId as any)?.fullName || '';
                const _driverQuery2: any = this.driverModel.findById(driverId);
                const driver = (_driverQuery2 && typeof _driverQuery2.lean === 'function')
                    ? await _driverQuery2.lean()
                    : await _driverQuery2;
                const driverName = driver?.fullName || 'Driver';
                if (userEmail && this.mailService) {
                    await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'ACCEPTED', updatedBooking?.toObject?.() || {});
                }
            } catch (emailErr) {
                this.logger.error('Failed to send acceptance email to user', emailErr);
            }

            return {
                bookingId: updatedBooking._id.toString(),
                status: 'ACCEPTED',
                message: 'Ride accepted successfully',
            };
        } catch (error) {
            this.logger.error('Error accepting ride:', error);
            throw error;
        }
    }

    /**
     * Get current ride status for customer
     * Customer polls this API to check if ride is accepted
     */
    async getRideStatus(bookingId: string) {
        try {
            const booking = await this.bookingModel
                .findById(bookingId)
                .populate('driverId', 'fullName phoneNumber profileImage')
                .populate('vehicleId', 'vehicleModel licensePlate vehicleImages')
                .lean();

            if (!booking) {
                throw new BadRequestException('Ride not found');
            }

            return {
                bookingId: booking._id.toString(),
                status: booking.status,
                driver: booking.driverId
                    ? {
                        driverId: (booking.driverId as any)._id?.toString(),
                        name: (booking.driverId as any).fullName,
                        phone: (booking.driverId as any).phoneNumber,
                        photo: (booking.driverId as any).profileImage,
                    }
                    : null,
                vehicle: booking.vehicleId
                    ? {
                        vehicleId: (booking.vehicleId as any)._id?.toString(),
                        model: (booking.vehicleId as any).vehicleModel,
                        licensePlate: (booking.vehicleId as any).licensePlate,
                        photos: (booking.vehicleId as any).vehicleImages,
                    }
                    : null,
                pickupLocation: booking.pickupLocation,
                dropoffLocation: booking.dropoffLocation,
                estimatedFare: booking.estimatedFare,
            };
        } catch (error) {
            this.logger.error('Error fetching ride status:', error);
            throw error;
        }
    }

    /**
     * Get driver's current location
     * Customer polls this to track driver on map
     */
    async getDriverLocation(bookingId: string) {
        try {
            const booking = await this.bookingModel
                .findById(bookingId)
                .populate('driverId', 'latitude longitude')
                .lean();

            if (!booking || !booking.driverId) {
                throw new BadRequestException('Driver not found for this booking');
            }

            return {
                driverId: (booking.driverId as any)._id?.toString(),
                latitude: (booking.driverId as any).latitude,
                longitude: (booking.driverId as any).longitude,
                lastUpdated: (booking.driverId as any).lastLocationUpdate,
            };
        } catch (error) {
            this.logger.error('Error fetching driver location:', error);
            throw error;
        }
    }
    async rejectRide(bookingId: string, driverId: string) {
        try {
            // Check if booking exists and is PENDING
            const booking = await this.bookingModel.findById(bookingId);

            if (!booking) {
                throw new BadRequestException('Booking not found');
            }

            if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
                throw new BadRequestException(
                    `Cannot reject ride with status: ${booking.status}`,
                );
            }

            // Track rejection for analytics (optional)
            if (!booking.rejectedDrivers) {
                booking.rejectedDrivers = [];
            }
            booking.rejectedDrivers.push(new Types.ObjectId(driverId));

            // If booking was ACCEPTED by this driver, mark it REJECTED and notify user
            let responsePayload: any = {};
            if (booking.driverId?.toString() === driverId) {
                booking.driverId = undefined;
                booking.status = 'REJECTED';
                booking.acceptedTime = undefined;

                // Notify user by email about rejection
                try {
                    const populated = await this.bookingModel.findById(bookingId).populate('userId', 'fullName email').exec();
                    const userEmail = (populated?.userId as any)?.email || null;
                    const userName = (populated?.userId as any)?.fullName || '';
                    const _driverQuery3: any = this.driverModel.findById(driverId);
                    const driver = (_driverQuery3 && typeof _driverQuery3.lean === 'function')
                        ? await _driverQuery3.lean()
                        : await _driverQuery3;
                    const driverName = driver?.fullName || 'Driver';
                    if (userEmail) {
                        await this.mailService.sendDriverResponseEmailToUser(userEmail, userName, driverName, 'REJECTED', populated?.toObject?.() || booking?.toObject?.());
                    }
                } catch (emailErr) {
                    this.logger.error('Failed to send rejection email to user', emailErr);
                }

                responsePayload = {
                    bookingId: booking._id.toString(),
                    status: 'REJECTED',
                    message: 'Booking rejected by assigned driver',
                    rejectionCount: booking.rejectedDrivers?.length ?? 0,
                };
            } else {
                // If this driver was not assigned, keep booking PENDING and mark driver busy briefly
                try {
                    const busyUntil = new Date(Date.now() + 3 * 60 * 1000);
                    await this.driverModel.findByIdAndUpdate(driverId, { $set: { busyUntil } });
                } catch (e) {
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

            this.logger.log(
                `❌ Driver ${driverId} rejected ride ${bookingId}`,
            );

            return responsePayload;
        } catch (error) {
            this.logger.error('Error rejecting ride:', error);
            throw error;
        }
    }

    /**
     * Get customer's location
     * Driver polls this to see pickup location
     */
    async getCustomerLocation(bookingId: string) {
        try {
            const booking = await this.bookingModel
                .findById(bookingId)
                .lean();

            if (!booking) {
                throw new BadRequestException('Booking not found');
            }

            return {
                customerId: booking.userId.toString(),
                latitude: booking.pickupLatitude,
                longitude: booking.pickupLongitude,
                address: booking.pickupLocation,
            };
        } catch (error) {
            this.logger.error('Error fetching customer location:', error);
            throw error;
        }
    }
}

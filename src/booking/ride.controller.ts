/* eslint-disable prettier/prettier */
import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Request,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { RideService, RideRequest } from './ride.service';
import { BookingService } from './booking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleRequired } from '../common/decorators/role.decorator';
import { Role } from '../common/role.enum';

@Controller('api/rides')
export class RideController {
    private logger = new Logger('RideController');

    constructor(private rideService: RideService, private bookingService: BookingService) { }

    /**
     * CUSTOMER: Create a new ride booking
     * POST /rides/create
     * 
     * Request body:
     * {
     *   "pickupLatitude": 10.0425,
     *   "pickupLongitude": 76.3277,
     *   "dropoffLatitude": 10.0500,
     *   "dropoffLongitude": 76.3350,
     *   "pickupAddress": "Kochi Airport",
     *   "dropoffAddress": "Fort Kochi",
     *   "estimatedFare": 250
     * }
     */
    @Post('create')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.USER)
    async createRide(
        @Request() req,
        @Body()
        rideData: {
            pickupLatitude: number;
            pickupLongitude: number;
            dropoffLatitude: number;
            dropoffLongitude: number;
            pickupAddress: string;
            dropoffAddress: string;
            estimatedFare: number;
        },
    ) {
        try {
            const customerId = req.user.id;
            const customer = req.user;

            this.logger.log(`📍 Customer ${customerId} requesting ride...`);

            const result = await this.rideService.createRideAndNotifyDrivers(
                customerId,
                rideData.pickupLatitude,
                rideData.pickupLongitude,
                rideData.dropoffLatitude,
                rideData.dropoffLongitude,
                rideData.pickupAddress,
                rideData.dropoffAddress,
                rideData.estimatedFare,
            );

            return result;
        } catch (error) {
            this.logger.error('Error creating ride:', error);
            throw error;
        }
    }

    /**
     * DRIVER: Get pending ride requests (Polling API)
     * GET /rides/pending
     * 
     * Drivers call this every 5-10 seconds to check for new ride requests
     * Returns rides where driver is within 2 KM
     */
    @Get('pending')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    async getPendingRides(@Request() req) {
        try {
            const driverId = req.user.id;
            const pendingRides = await this.rideService.getPendingRidesForDriver(driverId);

            return {
                success: true,
                count: pendingRides.length,
                rides: pendingRides,
            };
        } catch (error) {
            this.logger.error('Error fetching pending rides:', error);
            throw error;
        }
    }

    /**
     * DRIVER: Accept a ride
     * POST /rides/:rideId/accept
     * 
     * Driver clicks accept button on ride card
     */
    @Post(':rideId/accept')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    async acceptRide(@Request() req, @Param('rideId') rideId: string) {
        try {
            const driverId = req.user.id;

            const result = await this.rideService.acceptRide(rideId, driverId);

            this.logger.log(`✅ Ride ${rideId} accepted by driver ${driverId}`);

            return result;
        } catch (error) {
            this.logger.error('Error accepting ride:', error);
            throw error;
        }
    }

    /**
     * CUSTOMER: Get ride status (Polling API)
     * GET /rides/:rideId/status
     * 
     * Customer calls this every 2-5 seconds to check:
     * - If ride is accepted
     * - Driver details (name, photo, vehicle)
     * - Current ride status
     */
    @Get(':rideId/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.USER)
    async getRideStatus(@Request() req, @Param('rideId') rideId: string) {
        try {
            const status = await this.rideService.getRideStatus(rideId);

            return {
                success: true,
                ride: status,
            };
        } catch (error) {
            this.logger.error('Error fetching ride status:', error);
            throw error;
        }
    }

    /**
     * CUSTOMER: Get driver's current location (Polling API)
     * GET /rides/:rideId/driver-location
     * 
     * Customer polls this to show driver's location on map
     * Update frequency: every 1-2 seconds
     */
    @Get(':rideId/driver-location')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.USER)
    async getDriverLocation(@Request() req, @Param('rideId') rideId: string) {
        try {
            const location = await this.rideService.getDriverLocation(rideId);

            return {
                success: true,
                location: location,
            };
        } catch (error) {
            this.logger.error('Error fetching driver location:', error);
            throw error;
        }
    }
    @Post(':rideId/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    async rejectRide(@Request() req, @Param('rideId') rideId: string) {
        const driverId = req.user.id;
        return await this.rideService.rejectRide(rideId, driverId);
    }

    /**
     * DRIVER: Cancel a ride (mark booking as CANCELLED)
     * POST /rides/:rideId/cancel
     */
    @Post(':rideId/cancel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    async cancelRide(@Request() req, @Param('rideId') rideId: string) {
        // Reuse booking cancellation logic and mark driver as canceller
        const driverId = req.user.id;
        const cancelled = await this.bookingService.cancelBooking(rideId, { byDriverId: driverId, reason: 'Driver cancelled the ride' });
        return { success: true, bookingId: cancelled._id?.toString(), status: cancelled.status };
    }

    /**
     * DRIVER: Get customer's pickup location (Polling API)
     * GET /rides/:rideId/customer-location
     * 
     * Driver polls this to see customer's pickup location on map
     */
    @Get(':rideId/customer-location')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RoleRequired(Role.DRIVER)
    async getCustomerLocation(@Request() req, @Param('rideId') rideId: string) {
        try {
            const location = await this.rideService.getCustomerLocation(rideId);

            return {
                success: true,
                location: location,
            };
        } catch (error) {
            this.logger.error('Error fetching customer location:', error);
            throw error;
        }
    }
}

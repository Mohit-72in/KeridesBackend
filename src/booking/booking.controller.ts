/* eslint-disable prettier/prettier */
import {
    Controller,
    Post,
    Get,
    Patch,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { NearbyDriversQueryDto } from './dto/nearby-drivers-query.dto';
import { FindNearestDriversDto } from './dto/find-nearest-drivers.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleRequired } from '../common/decorators/role.decorator';
import { Role } from '../common/role.enum';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
    constructor(private bookingService: BookingService) { }

    /**
     * USER or DRIVER: Create a new booking (Status: pending)
     * POST /bookings/create
     */
    @Post('create')
    @RoleRequired([Role.USER, Role.DRIVER])
    async createBooking(
        @Request() req,
        @Body() createBookingDto: CreateBookingDto,
    ) {
        console.log('🔵 [BOOKING CONTROLLER] POST /bookings/create called');
        console.log('🔵 [BOOKING CONTROLLER] User ID:', req.user?.id);
        console.log('🔵 [BOOKING CONTROLLER] User Role:', req.user?.role);
        console.log('🔵 [BOOKING CONTROLLER] Request body:', JSON.stringify(createBookingDto, null, 2));

        // Validate payment method
        const validPaymentMethods = ['CASH', 'CARD', 'UPI', 'WALLET'];
        if (createBookingDto.paymentMethod && !validPaymentMethods.includes(createBookingDto.paymentMethod.toUpperCase())) {
            throw new BadRequestException(`Invalid payment method. Allowed: ${validPaymentMethods.join(', ')}`);
        }

        // Validate fare amount
        if (!createBookingDto.price?.total || createBookingDto.price.total <= 0) {
            throw new BadRequestException('Invalid fare amount. Fare must be greater than 0');
        }

        // Validate location data
        if (!createBookingDto.origin?.location?.lat || !createBookingDto.origin?.location?.lng) {
            throw new BadRequestException('Invalid pickup location');
        }
        if (!createBookingDto.destination?.location?.lat || !createBookingDto.destination?.location?.lng) {
            throw new BadRequestException('Invalid drop-off location');
        }

        // Validate distance
        if (!createBookingDto.distance?.value || createBookingDto.distance.value <= 0) {
            throw new BadRequestException('Invalid distance calculation');
        }

        const result = await this.bookingService.createBooking(req.user.id, createBookingDto);

        console.log('🔵 [BOOKING CONTROLLER] Booking created, returning response');
        return result;
    }


    /**
     * USER: Get all their bookings with status
     * GET /bookings/my-bookings
     */
    @Get('my-bookings')
    @RoleRequired(Role.USER)
    async getUserBookings(@Request() req) {
        return await this.bookingService.getUserBookings(req.user.id);
    }

    /**
     * USER: Get current active booking with OTP (to share with driver)
     * GET /bookings/my-bookings/current
     */
    @Get('my-bookings/current')
    @RoleRequired(Role.USER)
    async getUserCurrentBooking(@Request() req) {
        return await this.bookingService.getUserCurrentBooking(req.user.id);
    }

    /**
     * USER: Get their pending bookings
     * GET /bookings/my-bookings/pending
     */
    @Get('my-bookings/pending')
    @RoleRequired(Role.USER)
    async getUserPendingBookings(@Request() req) {
        return await this.bookingService.getUserPendingBookings(req.user.id);
    }

    /**
     * DRIVER: Get all pending bookings (available for drivers)
     * GET /bookings/pending/list
     */
    @Get('pending/list')
    @RoleRequired(Role.DRIVER)
    async getPendingBookings() {
        return await this.bookingService.getPendingBookings();
    }

    /**
     * DRIVER: Get pending bookings assigned to this driver
     * Used by driver to see incoming ride requests via polling
     * GET /bookings/pending-for-driver
     */
    @Get('pending-for-driver')
    @RoleRequired(Role.DRIVER)
    async getPendingBookingsForDriver(@Request() req) {
        return await this.bookingService.getPendingBookingsForDriver(req.user.id);
    }

    /**
     * DRIVER: Get current active booking (ACCEPTED, DRIVER_ARRIVED, or IN_PROGRESS)
     * GET /bookings/driver/current
     */
    @Get('driver/current')
    @RoleRequired(Role.DRIVER)
    async getDriverCurrentBooking(@Request() req) {
        return await this.bookingService.getDriverCurrentBooking(req.user.id);
    }

    /**
     * DRIVER: Get specific booking details (respects OTP verification for drop location)
     * GET /bookings/driver/:bookingId
     */
    @Get('driver/booking/:bookingId')
    @RoleRequired(Role.DRIVER)
    async getBookingForDriver(
        @Param('bookingId') bookingId: string,
        @Request() req,
    ) {
        return await this.bookingService.getBookingForDriverById(bookingId, req.user.id);
    }

    /**
     * DRIVER: Get their accepted/completed bookings history
     * GET /bookings/driver/my-bookings
     */
    @Get('driver/my-bookings')
    @RoleRequired(Role.DRIVER)
    async getDriverBookings(@Request() req) {
        return await this.bookingService.getBookingsByDriver(req.user.id);
    }

    /**
     * DRIVER: Get all bookings (completed, accepted, pending, etc.)
     * GET /bookings/driver/all
     */
    @Get('driver/all')
    @RoleRequired(Role.DRIVER)
    async getAllDriverBookings(@Request() req) {
        return await this.bookingService.getBookingsByDriver(req.user.id);
    }

    /**
     * ADMIN / SUPPORT: Get bookings for any driver by driverId
     * - Allowed if requester is the same driver OR presents a valid ADMIN API key in `x-admin-key`
     * GET /bookings/driver/:driverId/bookings
     */
    @Get('driver/:driverId/bookings')
    async getBookingsForDriverById(@Param('driverId') driverId: string, @Request() req) {
        const adminKey = process.env.ADMIN_API_KEY || '';
        const provided = (req.headers['x-admin-key'] || req.headers['x-admin-key']?.toString?.()) || '';

        const isSelf = req.user?.id && req.user.id === driverId;
        const isAdminKeyValid = adminKey && provided === adminKey;

        if (!isSelf && !isAdminKeyValid) {
            throw new ForbiddenException('Not authorized to fetch bookings for this driver');
        }

        return await this.bookingService.getBookingsByDriver(driverId);
    }

    /**
     * DRIVER: Get completed bookings history
     * GET /bookings/driver/completed
     */
    @Get('driver/completed')
    @RoleRequired(Role.DRIVER)
    async getDriverCompletedBookings(@Request() req) {
        return await this.bookingService.getDriverCompletedBookings(req.user.id);
    }

    /**
     * DRIVER: Get active/ongoing bookings
     * GET /bookings/driver/active
     */
    @Get('driver/active')
    @RoleRequired(Role.DRIVER)
    async getDriverActiveBookings(@Request() req) {
        return await this.bookingService.getDriverActiveBookings(req.user.id);
    }

    /**
     * DRIVER: Get cancelled bookings
     * GET /bookings/driver/cancelled
     */
    @Get('driver/cancelled')
    @RoleRequired(Role.DRIVER)
    async getDriverCancelledBookings(@Request() req) {
        return await this.bookingService.getDriverCancelledBookings(req.user.id);
    }

    /**
     * USER/DRIVER: Get nearby available drivers within specified radius
     * Now supports both USER and DRIVER roles
     * GET /bookings/nearby-drivers?latitude=9.93&longitude=76.26&radius=2
     */
    @Get('nearby-drivers')
    @RoleRequired([Role.USER, Role.DRIVER])
    async getNearbyDrivers(@Query() query: NearbyDriversQueryDto, @Request() req) {
        return await this.bookingService.getNearbyDrivers(req.user.id, query, req.user.role);
    }

    /**
     * USER/DRIVER: Get nearby available drivers without operating area restriction
     * Useful for testing or when operating area is not set
     * GET /bookings/nearby-drivers-flexible?latitude=9.93&longitude=76.26&radius=2
     */
    @Get('nearby-drivers-flexible')
    @RoleRequired([Role.USER, Role.DRIVER])
    async getNearbyDriversFlexible(@Query() query: NearbyDriversQueryDto) {
        return await this.bookingService.getNearbyDriversFlexible(query);
    }

    /**
     * USER: Find nearest 5 drivers matching vehicle type
     * POST /bookings/find-nearest-drivers
     */
    @Post('find-nearest-drivers')
    @RoleRequired([Role.USER, Role.DRIVER])
    async findNearestDrivers(
        @Body() findNearestDriversDto: FindNearestDriversDto,
    ) {
        return await this.bookingService.findNearestDrivers(
            findNearestDriversDto.pickupLatitude,
            findNearestDriversDto.pickupLongitude,
            findNearestDriversDto.vehicleType,
        );
    }

    /**
     * Estimate fare using server-side logic
     * POST /bookings/estimate
     */
    @Post('estimate')
    @RoleRequired([Role.USER, Role.DRIVER])
    async estimateFare(@Body() body: any) {
        const distance = body?.distance?.value || 0;
        const duration = body?.duration?.value || 0;
        const vehicleId = body?.vehicleId;
        const driverId = body?.driverId;

        return await this.bookingService.estimateFare(distance, duration, vehicleId, driverId);
    }

    /**
     * DRIVER: Accept a pending booking - changes status to "accepted"
     * Returns booking with ONLY pickup location (drop location hidden until OTP verified)
     * POST /bookings/:bookingId/accept
     */
    @Post(':bookingId/accept')
    @RoleRequired(Role.DRIVER)
    async acceptBooking(
        @Param('bookingId') bookingId: string,
        @Request() req,
        @Body() body: { vehicleId: string },
    ) {
        return await this.bookingService.acceptBooking(bookingId, req.user.id, body.vehicleId);
    }

    /**
     * DRIVER: Mark arrival at pickup location
     * PATCH /bookings/:bookingId/arrived
     */
    @Patch(':bookingId/arrived')
    @RoleRequired(Role.DRIVER)
    async driverArrived(
        @Param('bookingId') bookingId: string,
        @Request() req,
    ) {
        return await this.bookingService.driverArrived(bookingId, req.user.id);
    }

    /**
     * DRIVER: Verify OTP and start ride - reveals drop location
     * POST /bookings/:bookingId/verify-otp
     */
    @Post(':bookingId/verify-otp')
    @RoleRequired(Role.DRIVER)
    async verifyOtpAndStartRide(
        @Param('bookingId') bookingId: string,
        @Request() req,
        @Body() verifyOtpDto: VerifyOtpDto,
    ) {
        return await this.bookingService.verifyOtpAndStartRide(bookingId, req.user.id, verifyOtpDto.otp);
    }

    /**
     * DRIVER: Start the ride (DEPRECATED - use verify-otp instead)
     * PATCH /bookings/:bookingId/start
     */
    @Patch(':bookingId/start')
    @RoleRequired(Role.DRIVER)
    async startRide(@Param('bookingId') bookingId: string) {
        return await this.bookingService.startRide(bookingId);
    }

    /**
     * DRIVER: Complete the ride - marks journey as successful
     * PATCH /bookings/:bookingId/complete
     */
    @Patch(':bookingId/complete')
    @RoleRequired(Role.DRIVER)
    async completeRide(
        @Param('bookingId') bookingId: string,
        @Request() req,
    ) {
        return await this.bookingService.completeRide(bookingId, req.user.id);
    }

    /**
     * USER: Get specific booking details
     * GET /bookings/:bookingId
     */
    @Get(':bookingId')
    @RoleRequired(Role.USER)
    async getBookingById(@Param('bookingId') bookingId: string) {
        return await this.bookingService.getBookingById(bookingId);
    }

    /**
     * USER: Cancel their booking
     * PATCH /bookings/:bookingId/cancel
     */
    @Patch(':bookingId/cancel')
    @RoleRequired(Role.USER)
    async cancelBooking(@Param('bookingId') bookingId: string) {
        return await this.bookingService.cancelBooking(bookingId);
    }

    /**
     * USER: Rate completed booking
     * POST /bookings/:bookingId/rate
     */
    @Post(':bookingId/rate')
    @RoleRequired(Role.USER)
    async rateBooking(
        @Param('bookingId') bookingId: string,
        @Body() rateBookingDto: RateBookingDto,
    ) {
        return await this.bookingService.rateBooking(bookingId, rateBookingDto);
    }
}

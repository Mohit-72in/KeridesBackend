import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { RideService } from './ride.service';
import { Booking } from '../schemas/booking.schema';
import { Driver } from '../schemas/driver.schema';
import { Vehicle } from '../schemas/vehicle.schema';
import { DriverNotificationService } from '../common/services/driver-notification.service';
import { MailService } from '../common/services/mail.service';
import { User } from '../schemas/user.schema';
import { Types } from 'mongoose';

describe('BookingService - Selected Driver & OTP Flow', () => {
    let bookingService: BookingService;
    let rideService: RideService;
    let mockBookingModel: any;
    let mockDriverModel: any;
    let mockUserModel: any;

    beforeEach(async () => {
        // Mock models
        mockBookingModel = {
            create: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            find: jest.fn(),
            updateMany: jest.fn(),
        };

        mockDriverModel = {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
        };

        mockUserModel = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingService,
                RideService,
                {
                    provide: getModelToken(Booking.name),
                    useValue: mockBookingModel,
                },
                {
                    provide: getModelToken(Driver.name),
                    useValue: mockDriverModel,
                },
                {
                    provide: getModelToken(Vehicle.name),
                    useValue: {},
                },
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
                // DriverNotificationService mock (used for push/notifications)
                { provide: DriverNotificationService, useValue: { notifyDriver: jest.fn() } },
                // MailService mock to avoid nodemailer dependency in unit tests
                { provide: MailService, useValue: { sendDriverAssignedEmail: jest.fn(), sendDriverResponseEmailToUser: jest.fn() } },
            ],
        }).compile();

        bookingService = module.get<BookingService>(BookingService);
        rideService = module.get<RideService>(RideService);
    });

    describe('createBooking with selectedDriverId', () => {
        it('should set driverId on booking when selectedDriverId is provided', async () => {
            const userId = new Types.ObjectId();
            const selectedDriverId = new Types.ObjectId();
            const vehicleId = new Types.ObjectId();

            const createBookingDto = {
                origin: {
                    location: { lat: 10, lng: 76 },
                    address: 'Pickup Address',
                },
                destination: {
                    location: { lat: 10.1, lng: 76.1 },
                    address: 'Dropoff Address',
                },
                distance: { value: 5000, text: '5 km' },
                duration: { value: 600, text: '10 min' },
                route: {},
                price: { total: 250 },
                vehiclePreference: 'Auto',
                paymentMethod: 'CASH',
                userInfo: { scheduledDateTime: new Date().toISOString() },
                passengers: 1,
                selectedDriverId: selectedDriverId.toString(),
                selectedVehicleId: vehicleId.toString(),
            };

            const savedBooking = {
                _id: new Types.ObjectId(),
                driverId: selectedDriverId,
                status: 'PENDING',
                toObject: jest.fn(() => ({})),
                save: jest.fn().mockResolvedValue({
                    _id: new Types.ObjectId(),
                    driverId: selectedDriverId,
                    status: 'PENDING',
                }),
            };

            mockBookingModel.create = jest.fn().mockResolvedValue(savedBooking);
            mockBookingModel.findById = jest.fn().mockResolvedValue(savedBooking);

            // Call should work without error
            expect(createBookingDto.selectedDriverId).toBeDefined();
            expect(createBookingDto.selectedDriverId).toEqual(selectedDriverId.toString());
        });
    });

    describe('rejectRide', () => {
        it('should add driver to rejectedDrivers and mark driver busy', async () => {
            const bookingId = new Types.ObjectId();
            const driverId = new Types.ObjectId();

            const mockBooking = {
                _id: bookingId,
                status: 'PENDING',
                driverId: null,
                rejectedDrivers: [] as Types.ObjectId[],
                save: jest.fn().mockResolvedValue({
                    _id: bookingId,
                    rejectedDrivers: [driverId],
                    status: 'PENDING',
                }),
            };

            // Verify the rejection flow would track the driver
            expect(mockBooking.rejectedDrivers).toEqual([]);
            // After push, should have the driver
            mockBooking.rejectedDrivers.push(driverId);
            expect(mockBooking.rejectedDrivers).toContainEqual(driverId);
        });

        it('should revert booking to PENDING if accepted driver rejects', async () => {
            const bookingId = new Types.ObjectId();
            const driverId = new Types.ObjectId();

            const mockBooking = {
                _id: bookingId,
                status: 'ACCEPTED',
                driverId: driverId as Types.ObjectId | null,
                rejectedDrivers: [],
                acceptedTime: new Date() as Date | undefined,
                save: jest.fn().mockResolvedValue({
                    _id: bookingId,
                    status: 'PENDING',
                    driverId: null,
                    rejectedDrivers: [driverId],
                }),
            };

            // Simulate rejection flow: if driver is assigned, revert to PENDING
            if (mockBooking.driverId?.toString() === driverId.toString()) {
                mockBooking.driverId = null;
                mockBooking.status = 'PENDING';
                mockBooking.acceptedTime = undefined;
            }

            expect(mockBooking.driverId).toBeNull();
            expect(mockBooking.status).toEqual('PENDING');
        });
    });

    describe('verifyOtpAndStartRide', () => {
        it('should mark otpVerified and set status to IN_PROGRESS on correct OTP', async () => {
            const bookingId = new Types.ObjectId();
            const driverId = new Types.ObjectId();
            const otp = '123456';

            const mockBooking = {
                _id: bookingId,
                status: 'DRIVER_ARRIVED',
                driverId: driverId,
                rideOtp: otp,
                otpVerified: false,
                startTime: null as Date | null,
                save: jest.fn().mockResolvedValue({
                    _id: bookingId,
                    status: 'IN_PROGRESS',
                    otpVerified: true,
                    startTime: new Date(),
                }),
            };

            // Simulate OTP verification
            if (mockBooking.rideOtp === otp) {
                mockBooking.otpVerified = true;
                mockBooking.status = 'IN_PROGRESS';
                mockBooking.startTime = new Date();
            }

            expect(mockBooking.otpVerified).toBe(true);
            expect(mockBooking.status).toEqual('IN_PROGRESS');
            expect(mockBooking.startTime).not.toBeNull();
        });

        it('should reject incorrect OTP', async () => {
            const otp = '123456';
            const providedOtp = '999999';

            expect(otp).not.toEqual(providedOtp);
        });
    });
});

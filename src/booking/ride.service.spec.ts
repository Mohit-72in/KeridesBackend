import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RideService } from './ride.service';
import { Booking } from '../schemas/booking.schema';
import { Driver } from '../schemas/driver.schema';
import { Vehicle } from '../schemas/vehicle.schema';
import { MailService } from '../common/services/mail.service';
import { Types } from 'mongoose';

describe('RideService - getPendingRidesForDriver (Selected Driver Filter)', () => {
    let rideService: RideService;
    let mockBookingModel: any;
    let mockDriverModel: any;
    let mockVehicleModel: any;

    const driverId = new Types.ObjectId();
    const otherDriverId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    beforeEach(async () => {
        mockBookingModel = {
            find: jest.fn(),
        };

        mockDriverModel = {
            findById: jest.fn(),
            updateMany: jest.fn(),
        };

        mockVehicleModel = {
            findOne: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
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
                    useValue: mockVehicleModel,
                },
                // MailService is optional in tests — provide a lightweight mock
                { provide: MailService, useValue: { sendDriverResponseEmailToUser: jest.fn(), sendDriverAssignedEmail: jest.fn() } },
            ],
        }).compile();

        rideService = module.get<RideService>(RideService);
    });

    describe('getPendingRidesForDriver - exclusion logic', () => {
        it('should exclude bookings assigned to a different driver', async () => {
            const currentDriver = {
                _id: driverId,
                latitude: 10,
                longitude: 76,
                busyUntil: null,
            };

            // Booking assigned to otherDriverId (not currentDriver)
            const assignedToOtherDriver = {
                _id: new Types.ObjectId(),
                userId: userId,
                status: 'PENDING',
                pickupLatitude: 10.001,
                pickupLongitude: 76.001,
                driverId: otherDriverId, // NOT this driver
                rejectedDrivers: [],
                distance: { value: 5000 },
                duration: { value: 600 },
                estimatedDistance: 5,
                estimatedFare: 250,
            };

            // Unassigned booking (open to all nearby drivers)
            const unassignedBooking = {
                _id: new Types.ObjectId(),
                userId: userId,
                status: 'PENDING',
                pickupLatitude: 10.002,
                pickupLongitude: 76.002,
                driverId: null, // Not assigned
                rejectedDrivers: [],
                distance: { value: 3000 },
                duration: { value: 300 },
                estimatedDistance: 3,
                estimatedFare: 150,
            };

            mockDriverModel.findById.mockResolvedValue(currentDriver);
            mockVehicleModel.findOne.mockResolvedValue(null);
            mockBookingModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([
                        assignedToOtherDriver,
                        unassignedBooking,
                    ]),
                }),
            });

            const rides = await rideService.getPendingRidesForDriver(driverId.toString());

            // Should only return unassigned booking, not the one assigned to otherDriverId
            expect(rides.length).toBe(1);
            expect(rides[0].bookingId).toEqual(unassignedBooking._id.toString());
        });

        it('should include bookings explicitly assigned to this driver', async () => {
            const currentDriver = {
                _id: driverId,
                latitude: 10,
                longitude: 76,
                busyUntil: null,
            };

            // Booking assigned to THIS driver
            const assignedToThisDriver = {
                _id: new Types.ObjectId(),
                userId: userId,
                status: 'PENDING',
                pickupLatitude: 10.001,
                pickupLongitude: 76.001,
                driverId: driverId, // THIS driver
                rejectedDrivers: [],
                distance: { value: 5000 },
                duration: { value: 600 },
                estimatedDistance: 5,
                estimatedFare: 250,
            };

            mockDriverModel.findById.mockResolvedValue(currentDriver);
            mockVehicleModel.findOne.mockResolvedValue(null);
            mockBookingModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([assignedToThisDriver]),
                }),
            });

            const rides = await rideService.getPendingRidesForDriver(driverId.toString());

            // Should return the booking assigned to this driver
            expect(rides.length).toBe(1);
            expect(rides[0].bookingId).toEqual(assignedToThisDriver._id.toString());
        });

        it('should exclude bookings where this driver already rejected', async () => {
            const currentDriver = {
                _id: driverId,
                latitude: 10,
                longitude: 76,
                busyUntil: null,
            };

            // Unassigned booking but this driver already rejected
            const rejectedByThisDriver = {
                _id: new Types.ObjectId(),
                userId: userId,
                status: 'PENDING',
                pickupLatitude: 10.001,
                pickupLongitude: 76.001,
                driverId: null,
                rejectedDrivers: [driverId], // This driver already rejected
                distance: { value: 3000 },
                duration: { value: 300 },
                estimatedDistance: 3,
                estimatedFare: 150,
            };

            mockDriverModel.findById.mockResolvedValue(currentDriver);
            mockVehicleModel.findOne.mockResolvedValue(null);
            mockBookingModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([rejectedByThisDriver]),
                }),
            });

            const rides = await rideService.getPendingRidesForDriver(driverId.toString());

            // Should NOT return booking this driver rejected
            expect(rides.length).toBe(0);
        });
    });

    describe('getPendingRidesForDriver - distance filtering', () => {
        it('should exclude bookings outside 2 KM radius', async () => {
            const currentDriver = {
                _id: driverId,
                latitude: 10,
                longitude: 76,
                busyUntil: null,
            };

            // Booking too far away (3+ KM)
            const farBooking = {
                _id: new Types.ObjectId(),
                userId: userId,
                status: 'PENDING',
                pickupLatitude: 10.03, // ~3 KM away
                pickupLongitude: 76.03,
                driverId: null,
                rejectedDrivers: [],
                distance: { value: 3000 },
                duration: { value: 300 },
                estimatedDistance: 3,
                estimatedFare: 150,
            };

            mockDriverModel.findById.mockResolvedValue(currentDriver);
            mockVehicleModel.findOne.mockResolvedValue(null);
            mockBookingModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([farBooking]),
                }),
            });

            const rides = await rideService.getPendingRidesForDriver(driverId.toString());

            // Should NOT include far booking (outside 2 KM)
            expect(rides.length).toBe(0);
        });

        it('should include bookings within 2 KM radius', async () => {
            const currentDriver = {
                _id: driverId,
                latitude: 10,
                longitude: 76,
                busyUntil: null,
            };

            // Booking within 2 KM
            const nearBooking = {
                _id: new Types.ObjectId(),
                userId: userId,
                status: 'PENDING',
                pickupLatitude: 10.01, // ~1 KM away
                pickupLongitude: 76.01,
                driverId: null,
                rejectedDrivers: [],
                distance: { value: 1000 },
                duration: { value: 100 },
                estimatedDistance: 1,
                estimatedFare: 100,
            };

            mockDriverModel.findById.mockResolvedValue(currentDriver);
            mockVehicleModel.findOne.mockResolvedValue(null);
            mockBookingModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([nearBooking]),
                }),
            });

            const rides = await rideService.getPendingRidesForDriver(driverId.toString());

            // Should include near booking
            expect(rides.length).toBe(1);
            expect(rides[0].bookingId).toEqual(nearBooking._id.toString());
        });
    });
});

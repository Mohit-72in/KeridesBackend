import { RideService, RideRequest } from './ride.service';
import { BookingService } from './booking.service';
export declare class RideController {
    private rideService;
    private bookingService;
    private logger;
    constructor(rideService: RideService, bookingService: BookingService);
    createRide(req: any, rideData: {
        pickupLatitude: number;
        pickupLongitude: number;
        dropoffLatitude: number;
        dropoffLongitude: number;
        pickupAddress: string;
        dropoffAddress: string;
        estimatedFare: number;
    }): Promise<{
        bookingId: string;
        status: string;
        driversNotified: number;
        nearbyDrivers: {
            driverId: any;
            name: any;
            distance: any;
        }[];
    }>;
    getPendingRides(req: any): Promise<{
        success: boolean;
        count: number;
        rides: RideRequest[];
    }>;
    acceptRide(req: any, rideId: string): Promise<{
        bookingId: string;
        status: string;
        message: string;
    }>;
    getRideStatus(req: any, rideId: string): Promise<{
        success: boolean;
        ride: {
            bookingId: string;
            status: string;
            driver: {
                driverId: any;
                name: any;
                phone: any;
                photo: any;
            } | null;
            vehicle: {
                vehicleId: any;
                model: any;
                licensePlate: any;
                photos: any;
            } | null;
            pickupLocation: string | undefined;
            dropoffLocation: string | undefined;
            estimatedFare: number | undefined;
        };
    }>;
    getDriverLocation(req: any, rideId: string): Promise<{
        success: boolean;
        location: {
            driverId: any;
            latitude: any;
            longitude: any;
            lastUpdated: any;
        };
    }>;
    rejectRide(req: any, rideId: string): Promise<any>;
    cancelRide(req: any, rideId: string): Promise<{
        success: boolean;
        bookingId: string;
        status: string;
    }>;
    getCustomerLocation(req: any, rideId: string): Promise<{
        success: boolean;
        location: {
            customerId: string;
            latitude: number | undefined;
            longitude: number | undefined;
            address: string | undefined;
        };
    }>;
}

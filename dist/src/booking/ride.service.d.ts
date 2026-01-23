import { Model } from 'mongoose';
import { BookingDocument } from '../schemas/booking.schema';
import { DriverDocument } from '../schemas/driver.schema';
import { VehicleDocument } from '../schemas/vehicle.schema';
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
export declare class RideService {
    private bookingModel;
    private driverModel;
    private vehicleModel;
    private mailService;
    private logger;
    constructor(bookingModel: Model<BookingDocument>, driverModel: Model<DriverDocument>, vehicleModel: Model<VehicleDocument>, mailService: MailService);
    createRideAndNotifyDrivers(customerId: string, pickupLat: number, pickupLng: number, dropoffLat: number, dropoffLng: number, pickupAddress: string, dropoffAddress: string, estimatedFare: number): Promise<{
        bookingId: string;
        status: string;
        driversNotified: number;
        nearbyDrivers: {
            driverId: any;
            name: any;
            distance: any;
        }[];
    }>;
    getPendingRidesForDriver(driverId: string): Promise<RideRequest[]>;
    acceptRide(bookingId: string, driverId: string): Promise<{
        bookingId: string;
        status: string;
        message: string;
    }>;
    getRideStatus(bookingId: string): Promise<{
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
    }>;
    getDriverLocation(bookingId: string): Promise<{
        driverId: any;
        latitude: any;
        longitude: any;
        lastUpdated: any;
    }>;
    rejectRide(bookingId: string, driverId: string): Promise<any>;
    getCustomerLocation(bookingId: string): Promise<{
        customerId: string;
        latitude: number | undefined;
        longitude: number | undefined;
        address: string | undefined;
    }>;
}

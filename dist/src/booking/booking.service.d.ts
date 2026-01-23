import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { DriverDocument } from '../schemas/driver.schema';
import { VehicleDocument } from '../schemas/vehicle.schema';
import { UserDocument } from '../schemas/user.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { NearbyDriversQueryDto } from './dto/nearby-drivers-query.dto';
import { DriverNotificationService } from '../common/services/driver-notification.service';
import { MailService } from '../common/services/mail.service';
export declare class BookingService {
    private bookingModel;
    private driverModel;
    private vehicleModel;
    private userModel;
    private notificationService;
    private mailService;
    private logger;
    constructor(bookingModel: Model<BookingDocument>, driverModel: Model<DriverDocument>, vehicleModel: Model<VehicleDocument>, userModel: Model<UserDocument>, notificationService: DriverNotificationService, mailService: MailService);
    private calculateBookingFare;
    private generateOtp;
    private generateBookingId;
    private toObjectId;
    private formatDriverForBooking;
    private formatVehicleForBooking;
    createBooking(userId: string, createBookingDto: CreateBookingDto): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getPendingBookings(): Promise<(import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getPendingBookingsForDriver(driverId: string): Promise<{
        rideId: any;
        bookingId: any;
        customerId: any;
        customerName: any;
        pickupLocation: any;
        dropoffLocation: any;
        dropLocation: any;
        pickupLatitude: any;
        pickupLongitude: any;
        dropoffLatitude: any;
        dropoffLongitude: any;
        estimatedDistance: any;
        estimatedFare: any;
        status: any;
        bookingTime: any;
        isNearbyBooking: boolean;
    }[]>;
    getUserBookings(userId: string): Promise<any[]>;
    estimateFare(distanceInMeters: number, durationInSeconds: number, vehicleId?: string, driverId?: string): Promise<{
        estimatedFare: number;
    }>;
    getUserCurrentBooking(userId: string): Promise<{
        rideOtp: string | undefined;
        bookingId: string;
        userId: string;
        userInfo: {
            _id?: Types.ObjectId;
            email?: string;
            name: string;
            phone: string;
            date: string;
            time: string;
            scheduledDateTime: string;
            address?: string;
            bloodGroup?: string;
        };
        origin: {
            address: string;
            location: {
                lat: number;
                lng: number;
            };
        };
        destination: {
            address: string;
            location: {
                lat: number;
                lng: number;
            };
        };
        distance: {
            text: string;
            value: number;
        };
        duration: {
            text: string;
            value: number;
        };
        route: {
            summary: string;
            polyline: string;
            waypoints: Array<{
                type?: string;
                instruction?: string;
                distance?: {
                    text: string;
                    value: number;
                };
                duration?: {
                    text: string;
                    value: number;
                };
            }>;
            bounds?: {
                northeast: {
                    lat: number;
                    lng: number;
                };
                southwest: {
                    lat: number;
                    lng: number;
                };
            };
        };
        price: {
            baseFare?: number;
            minimumFare: number;
            bookingFee: number;
            total: number;
        };
        driver?: {
            id: string;
            details: {
                _id: string;
                name: string;
                email: string;
                phone: number;
                imageUrl?: string;
                drivinglicenseNo: string;
                agreement: boolean;
                personalInfo: {
                    dob: string;
                    address: string;
                    area: string;
                    bloodGroup: string;
                    emergencyContact: string;
                    languages: string[];
                    certifications: string[];
                };
                vehicles: Array<{
                    _id: string;
                    make: string;
                    vehicleModel: string;
                    vehicleType: string;
                    vehicleClass: string;
                    year: number;
                    licensePlate: string;
                    seatsNo: number;
                    vehicleImages: any[];
                    fareStructure: {
                        baseFare?: number;
                        minimumFare: number;
                        perKilometerRate: number;
                        waitingChargePerMinute: number;
                        cancellationFee?: number;
                    };
                    driverId: string;
                }>;
            };
        };
        vehicle?: {
            id: string;
            details: {
                _id: string;
                make: string;
                vehicleModel: string;
                vehicleType: string;
                vehicleClass: string;
                year: number;
                licensePlate: string;
                seatsNo: number;
                vehicleImages: any[];
                driverId: string;
                fareStructure: {
                    baseFare?: number;
                    minimumFare: number;
                    perKilometerRate: number;
                    waitingChargePerMinute: number;
                    cancellationFee?: number;
                };
            };
        };
        status: string;
        otpVerified: boolean;
        acceptedTime?: Date;
        arrivedTime?: Date;
        startTime?: Date;
        endTime?: Date;
        estimatedDistance?: number;
        estimatedFare?: number;
        actualDistance?: number;
        actualFare?: number;
        waitingTime?: number;
        waitingCharges?: number;
        paymentMethod: string;
        paymentCompleted: boolean;
        paymentVerifiedAt?: Date;
        confirmationStatus?: string;
        confirmedAt?: Date;
        confirmationNotes?: string;
        statusHistory?: Array<{
            status: string;
            confirmationStatus?: string;
            timestamp: Date;
            notes?: string;
            changedBy?: string;
            metadata?: any;
        }>;
        userNotes?: string;
        driverNotes?: string;
        driverRating?: number;
        driverReview?: string;
        userRating?: number;
        userReview?: string;
        isCompleted: boolean;
        passengers?: number;
        vehiclePreference?: string;
        timestamp: Date;
        driverId?: Types.ObjectId;
        vehicleId?: Types.ObjectId;
        pickupLocation?: string;
        dropoffLocation?: string;
        pickupLatitude?: number;
        pickupLongitude?: number;
        dropoffLatitude?: number;
        dropoffLongitude?: number;
        bookingTime?: Date;
        expiresAt?: Date;
        rejectedDrivers?: Types.ObjectId[];
        cancelledBy?: string;
        cancelledById?: Types.ObjectId;
        cancellationReason?: string;
        cancelledAt?: Date;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    } | null>;
    getUserPendingBookings(userId: string): Promise<(import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getBookingById(bookingId: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    acceptBooking(bookingId: string, driverId: string, vehicleId: string): Promise<any>;
    driverArrived(bookingId: string, driverId: string): Promise<any>;
    verifyOtpAndStartRide(bookingId: string, driverId: string, otp: string): Promise<{
        success: boolean;
        message: string;
        booking: any;
        rideDetails: {
            status: string;
            startTime: Date | undefined;
            pickupLocation: string | undefined;
            dropLocation: string | undefined;
            estimatedDistance: number | undefined;
            estimatedFare: number | undefined;
            route: {
                summary: string;
                polyline: string;
                waypoints: Array<{
                    type?: string;
                    instruction?: string;
                    distance?: {
                        text: string;
                        value: number;
                    };
                    duration?: {
                        text: string;
                        value: number;
                    };
                }>;
                bounds?: {
                    northeast: {
                        lat: number;
                        lng: number;
                    };
                    southwest: {
                        lat: number;
                        lng: number;
                    };
                };
            };
        };
    }>;
    private getBookingForDriver;
    startRide(bookingId: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    completeRide(bookingId: string, driverId?: string): Promise<{
        message: string;
        booking: import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        summary: {
            pickupLocation: string | undefined;
            dropoffLocation: string | undefined;
            distance: number | undefined;
            fare: number | undefined;
            startTime: Date | undefined;
            endTime: Date | undefined;
            paymentMethod: string;
            status: string;
        };
    }>;
    getDriverCurrentBooking(driverId: string): Promise<any>;
    getBookingForDriverById(bookingId: string, driverId: string): Promise<any>;
    cancelBooking(bookingId: string, options?: {
        byDriverId?: string;
        reason?: string;
    }): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    rateBooking(bookingId: string, rateBookingDto: RateBookingDto): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getBookingsByDriver(driverId: string): Promise<(import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDriverCompletedBookings(driverId: string): Promise<(import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDriverActiveBookings(driverId: string): Promise<(import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDriverCancelledBookings(driverId: string): Promise<(import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getNearbyDrivers(userId: string, queryDto: NearbyDriversQueryDto, userRole: string): Promise<any[]>;
    getNearbyDriversFlexible(queryDto: NearbyDriversQueryDto): Promise<any[]>;
    findNearestDrivers(pickupLatitude: number, pickupLongitude: number, vehicleType: string): Promise<{
        drivers: {
            driverId: string;
            driverName: string;
            vehicleType: any;
            vehicleDetails: {
                vehicleId: any;
                make: any;
                vehicleModel: any;
                year: any;
                licensePlate: any;
                seatsNo: any;
                vehicleImages: any;
            } | null;
            distanceFromUser: number;
            rating: number;
            totalTrips: number;
            phoneNumber: string;
        }[];
        totalFound: number;
        requestedVehicleType: string;
    }>;
    acceptRide(rideId: string, driverId: string): Promise<import("mongoose").Document<unknown, {}, BookingDocument, {}, {}> & Booking & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}

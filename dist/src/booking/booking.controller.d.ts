import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RateBookingDto } from './dto/rate-booking.dto';
import { NearbyDriversQueryDto } from './dto/nearby-drivers-query.dto';
import { FindNearestDriversDto } from './dto/find-nearest-drivers.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
export declare class BookingController {
    private bookingService;
    constructor(bookingService: BookingService);
    createBooking(req: any, createBookingDto: CreateBookingDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserBookings(req: any): Promise<any[]>;
    getUserCurrentBooking(req: any): Promise<{
        rideOtp: string | undefined;
        bookingId: string;
        userId: string;
        userInfo: {
            _id?: import("mongoose").Types.ObjectId;
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
        driverId?: import("mongoose").Types.ObjectId;
        vehicleId?: import("mongoose").Types.ObjectId;
        pickupLocation?: string;
        dropoffLocation?: string;
        pickupLatitude?: number;
        pickupLongitude?: number;
        dropoffLatitude?: number;
        dropoffLongitude?: number;
        bookingTime?: Date;
        expiresAt?: Date;
        rejectedDrivers?: import("mongoose").Types.ObjectId[];
        cancelledBy?: string;
        cancelledById?: import("mongoose").Types.ObjectId;
        cancellationReason?: string;
        cancelledAt?: Date;
        _id: import("mongoose").Types.ObjectId;
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
    getUserPendingBookings(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getPendingBookings(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getPendingBookingsForDriver(req: any): Promise<{
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
    getDriverCurrentBooking(req: any): Promise<any>;
    getBookingForDriver(bookingId: string, req: any): Promise<any>;
    getDriverBookings(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAllDriverBookings(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getBookingsForDriverById(driverId: string, req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDriverCompletedBookings(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDriverActiveBookings(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDriverCancelledBookings(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getNearbyDrivers(query: NearbyDriversQueryDto, req: any): Promise<any[]>;
    getNearbyDriversFlexible(query: NearbyDriversQueryDto): Promise<any[]>;
    findNearestDrivers(findNearestDriversDto: FindNearestDriversDto): Promise<{
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
    estimateFare(body: any): Promise<{
        estimatedFare: number;
    }>;
    acceptBooking(bookingId: string, req: any, body: {
        vehicleId: string;
    }): Promise<any>;
    driverArrived(bookingId: string, req: any): Promise<any>;
    verifyOtpAndStartRide(bookingId: string, req: any, verifyOtpDto: VerifyOtpDto): Promise<{
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
    startRide(bookingId: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    completeRide(bookingId: string, req: any): Promise<{
        message: string;
        booking: import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    getBookingById(bookingId: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cancelBooking(bookingId: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    rateBooking(bookingId: string, rateBookingDto: RateBookingDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/booking.schema").BookingDocument, {}, {}> & import("../schemas/booking.schema").Booking & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
}

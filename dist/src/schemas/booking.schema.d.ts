import { Document, Types } from 'mongoose';
export type BookingDocument = Booking & Document;
export declare class Booking {
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
    rideOtp?: string;
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
}
export declare const BookingSchema: import("mongoose").Schema<Booking, import("mongoose").Model<Booking, any, any, any, Document<unknown, any, Booking, any, {}> & Booking & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Booking, Document<unknown, {}, import("mongoose").FlatRecord<Booking>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Booking> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;

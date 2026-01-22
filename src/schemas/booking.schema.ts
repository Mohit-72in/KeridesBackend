import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
    // Unique booking identifier
    @Prop({ required: true, unique: true })
    bookingId: string;

    // User Reference
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: string;

    // User Information - Enhanced with email and additional details
    @Prop({
        type: {
            _id: Types.ObjectId,
            email: String,
            name: String,
            phone: String,
            date: String,
            time: String,
            scheduledDateTime: String,
            address: String,
            bloodGroup: String,
        },
        required: true,
    })
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

    // Origin location
    @Prop({
        type: {
            address: String,
            location: {
                lat: Number,
                lng: Number,
            },
        },
        required: true,
    })
    origin: {
        address: string;
        location: { lat: number; lng: number };
    };

    // Destination location
    @Prop({
        type: {
            address: String,
            location: {
                lat: Number,
                lng: Number,
            },
        },
        required: true,
    })
    destination: {
        address: string;
        location: { lat: number; lng: number };
    };

    // Distance information
    @Prop({
        type: {
            text: String,
            value: Number,
        },
        required: true,
    })
    distance: {
        text: string;
        value: number;
    };

    // Duration information
    @Prop({
        type: {
            text: String,
            value: Number,
        },
        required: true,
    })
    duration: {
        text: string;
        value: number;
    };

    // Route information
    @Prop({
        type: {
            summary: String,
            polyline: String,
            waypoints: [{
                type: String,
                instruction: String,
                distance: {
                    text: String,
                    value: Number,
                },
                duration: {
                    text: String,
                    value: Number,
                },
            }],
            bounds: {
                northeast: {
                    lat: Number,
                    lng: Number,
                },
                southwest: {
                    lat: Number,
                    lng: Number,
                },
            },
        },
        required: true,
    })
    route: {
        summary: string;
        polyline: string;
        waypoints: Array<{
            type?: string;
            instruction?: string;
            distance?: { text: string; value: number };
            duration?: { text: string; value: number };
        }>;
        bounds?: {
            northeast: { lat: number; lng: number };
            southwest: { lat: number; lng: number };
        };
    };

    // Price information
    @Prop({
        type: {
            baseFare: Number,
            minimumFare: Number,
            bookingFee: Number,
            total: Number,
        },
        required: true,
    })
    price: {
        baseFare?: number;
        minimumFare: number;
        bookingFee: number;
        total: number;
    };

    // Driver Information (embedded)
    @Prop({
        type: {
            id: String,
            details: {
                _id: String,
                name: String,
                email: String,
                phone: Number,
                imageUrl: String,
                drivinglicenseNo: String,
                agreement: Boolean,
                personalInfo: {
                    dob: String,
                    address: String,
                    area: String,
                    bloodGroup: String,
                    emergencyContact: String,
                    languages: [String],
                    certifications: [String],
                },
                vehicles: [{
                    _id: String,
                    make: String,
                    vehicleModel: String,
                    vehicleType: String,
                    vehicleClass: String,
                    year: Number,
                    licensePlate: String,
                    seatsNo: Number,
                    vehicleImages: [String],
                    fareStructure: {
                        baseFare: Number,
                        minimumFare: Number,
                        perKilometerRate: Number,
                        waitingChargePerMinute: Number,
                        cancellationFee: Number,
                    },
                    driverId: String,
                }],
            },
        },
    })
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

    // Vehicle Information (embedded)
    @Prop({
        type: {
            id: String,
            details: {
                _id: String,
                make: String,
                vehicleModel: String,
                vehicleType: String,
                vehicleClass: String,
                year: Number,
                licensePlate: String,
                seatsNo: Number,
                vehicleImages: [String],
                driverId: String,
                fareStructure: {
                    baseFare: Number,
                    minimumFare: Number,
                    perKilometerRate: Number,
                    waitingChargePerMinute: Number,
                    cancellationFee: Number,
                },
            },
        },
    })
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

    // Booking Status
    @Prop({
        enum: [
            'PENDING',
            'ACCEPTED',
            'REJECTED',
            'DRIVER_ARRIVED',
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED',
        ],
        default: 'PENDING',
    })
    status: string;

    // OTP for ride verification
    @Prop()
    rideOtp?: string;

    // Whether OTP has been verified
    @Prop({ default: false })
    otpVerified: boolean;

    // Timing
    @Prop()
    acceptedTime?: Date;

    @Prop()
    arrivedTime?: Date;

    @Prop()
    startTime?: Date;

    @Prop()
    endTime?: Date;

    // Distance & Fare
    @Prop()
    estimatedDistance?: number;

    @Prop()
    estimatedFare?: number;

    @Prop()
    actualDistance?: number;

    @Prop()
    actualFare?: number;

    @Prop()
    waitingTime?: number;

    @Prop()
    waitingCharges?: number;

    // Payment
    @Prop({ enum: ['CASH', 'CARD', 'WALLET', 'UPI'], default: 'CASH' })
    paymentMethod: string;

    @Prop({ default: false })
    paymentCompleted: boolean;

    @Prop()
    paymentVerifiedAt?: Date;

    // Confirmation Status
    @Prop({ enum: ['PENDING_PAYMENT', 'PENDING_DRIVER', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'PENDING_DRIVER' })
    confirmationStatus?: string;

    @Prop()
    confirmedAt?: Date;

    @Prop()
    confirmationNotes?: string;

    // Status History - Track all booking state changes
    @Prop({
        type: [{
            status: String,
            confirmationStatus: String,
            timestamp: Date,
            notes: String,
            changedBy: String, // 'USER' | 'DRIVER' | 'SYSTEM'
            metadata: Object,
        }],
        default: [],
    })
    statusHistory?: Array<{
        status: string;
        confirmationStatus?: string;
        timestamp: Date;
        notes?: string;
        changedBy?: string;
        metadata?: any;
    }>;

    // Notes
    @Prop()
    userNotes?: string;

    @Prop()
    driverNotes?: string;

    // Ratings
    @Prop({ min: 0, max: 5 })
    driverRating?: number;

    @Prop()
    driverReview?: string;

    @Prop({ min: 0, max: 5 })
    userRating?: number;

    @Prop()
    userReview?: string;

    @Prop({ default: false })
    isCompleted: boolean;

    // Passengers
    @Prop({ default: 1 })
    passengers?: number;

    // Vehicle preference
    @Prop()
    vehiclePreference?: string;

    // Timestamp for sorting/tracking
    @Prop({ default: Date.now })
    timestamp: Date;

    // Legacy fields for backward compatibility
    @Prop({ type: Types.ObjectId, ref: 'Driver' })
    driverId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
    vehicleId?: Types.ObjectId;

    @Prop()
    pickupLocation?: string;

    @Prop()
    dropoffLocation?: string;

    @Prop()
    pickupLatitude?: number;

    @Prop()
    pickupLongitude?: number;

    @Prop()
    dropoffLatitude?: number;

    @Prop()
    dropoffLongitude?: number;

    @Prop({ required: false })
    bookingTime?: Date;

    @Prop()
    expiresAt?: Date;

    // Track drivers who rejected this ride
    @Prop({ type: [Types.ObjectId], ref: 'Driver', default: [] })
    rejectedDrivers?: Types.ObjectId[];

    // Cancellation metadata
    @Prop()
    cancelledBy?: string; // 'DRIVER' | 'USER'

    @Prop()
    cancelledById?: Types.ObjectId;

    @Prop()
    cancellationReason?: string;

    @Prop()
    cancelledAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

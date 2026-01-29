"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingSchema = exports.Booking = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Booking = class Booking {
    userId;
    userInfo;
    origin;
    destination;
    distance;
    duration;
    route;
    price;
    driver;
    vehicle;
    status;
    rideOtp;
    otpVerified;
    acceptedTime;
    arrivedTime;
    startTime;
    endTime;
    estimatedDistance;
    estimatedFare;
    actualDistance;
    actualFare;
    waitingTime;
    waitingCharges;
    paymentMethod;
    paymentCompleted;
    paymentVerifiedAt;
    confirmationStatus;
    confirmedAt;
    confirmationNotes;
    statusHistory;
    userNotes;
    driverNotes;
    driverRating;
    driverReview;
    userRating;
    userReview;
    isCompleted;
    passengers;
    vehiclePreference;
    timestamp;
    driverId;
    vehicleId;
    pickupLocation;
    dropoffLocation;
    pickupLatitude;
    pickupLongitude;
    dropoffLatitude;
    dropoffLongitude;
    bookingTime;
    expiresAt;
    rejectedDrivers;
    cancelledBy;
    cancelledById;
    cancellationReason;
    cancelledAt;
};
exports.Booking = Booking;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", String)
], Booking.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            _id: mongoose_2.Types.ObjectId,
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
    }),
    __metadata("design:type", Object)
], Booking.prototype, "userInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            address: String,
            location: {
                lat: Number,
                lng: Number,
            },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Booking.prototype, "origin", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            address: String,
            location: {
                lat: Number,
                lng: Number,
            },
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Booking.prototype, "destination", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            text: String,
            value: Number,
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Booking.prototype, "distance", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            text: String,
            value: Number,
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Booking.prototype, "duration", void 0);
__decorate([
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", Object)
], Booking.prototype, "route", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            baseFare: Number,
            minimumFare: Number,
            bookingFee: Number,
            total: Number,
        },
        required: true,
    }),
    __metadata("design:type", Object)
], Booking.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", Object)
], Booking.prototype, "driver", void 0);
__decorate([
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", Object)
], Booking.prototype, "vehicle", void 0);
__decorate([
    (0, mongoose_1.Prop)({
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
    }),
    __metadata("design:type", String)
], Booking.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "rideOtp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "otpVerified", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "acceptedTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "arrivedTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "estimatedDistance", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "estimatedFare", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "actualDistance", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "actualFare", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "waitingTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "waitingCharges", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['CASH', 'CARD', 'WALLET', 'UPI'], default: 'CASH' }),
    __metadata("design:type", String)
], Booking.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "paymentCompleted", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "paymentVerifiedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['PENDING_PAYMENT', 'PENDING_DRIVER', 'ACTIVE', 'COMPLETED', 'CANCELLED'], default: 'PENDING_DRIVER' }),
    __metadata("design:type", String)
], Booking.prototype, "confirmationStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "confirmedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "confirmationNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                status: String,
                confirmationStatus: String,
                timestamp: Date,
                notes: String,
                changedBy: String,
                metadata: Object,
            }],
        default: [],
    }),
    __metadata("design:type", Array)
], Booking.prototype, "statusHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "userNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "driverNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, max: 5 }),
    __metadata("design:type", Number)
], Booking.prototype, "driverRating", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "driverReview", void 0);
__decorate([
    (0, mongoose_1.Prop)({ min: 0, max: 5 }),
    __metadata("design:type", Number)
], Booking.prototype, "userRating", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "userReview", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Booking.prototype, "isCompleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Booking.prototype, "passengers", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "vehiclePreference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Booking.prototype, "timestamp", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Driver' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Booking.prototype, "driverId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Vehicle' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Booking.prototype, "vehicleId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "pickupLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "dropoffLocation", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "pickupLatitude", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "pickupLongitude", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "dropoffLatitude", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Booking.prototype, "dropoffLongitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Date)
], Booking.prototype, "bookingTime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Driver', default: [] }),
    __metadata("design:type", Array)
], Booking.prototype, "rejectedDrivers", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "cancelledBy", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Booking.prototype, "cancelledById", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Booking.prototype, "cancellationReason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Booking.prototype, "cancelledAt", void 0);
exports.Booking = Booking = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Booking);
exports.BookingSchema = mongoose_1.SchemaFactory.createForClass(Booking);
exports.BookingSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
        ret.id = String(ret._id);
        delete ret._id;
    },
});
//# sourceMappingURL=booking.schema.js.map
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
exports.DriverSchema = exports.Driver = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Driver = class Driver {
    fullName;
    email;
    phoneNumber;
    password;
    driverLicenseNumber;
    address;
    profileImage;
    personalInfo;
    drivingExperience;
    documents;
    operatingArea;
    latitude;
    longitude;
    locationFieldType;
    coordinates;
    isOnline;
    lastLocationUpdate;
    busyUntil;
    role;
};
exports.Driver = Driver;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Driver.prototype, "fullName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Driver.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Driver.prototype, "phoneNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Driver.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Driver.prototype, "driverLicenseNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Driver.prototype, "address", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Driver.prototype, "profileImage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            bloodGroup: String,
            certificates: [String],
            dob: Date,
            emergencyContact: {
                name: String,
                phone: String,
                relationship: String,
            },
            languages: [String],
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Driver.prototype, "personalInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            yearsOfExperience: Number,
            licensedSince: Date,
            totalTripsCompleted: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Driver.prototype, "drivingExperience", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                url: String,
                key: String,
                uploadedAt: { type: Date, default: Date.now },
                fileName: String,
                fileType: String,
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Driver.prototype, "documents", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Driver.prototype, "operatingArea", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Driver.prototype, "latitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Driver.prototype, "longitude", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['Point'],
    }),
    __metadata("design:type", String)
], Driver.prototype, "locationFieldType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [Number],
    }),
    __metadata("design:type", Array)
], Driver.prototype, "coordinates", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Driver.prototype, "isOnline", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Driver.prototype, "lastLocationUpdate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Driver.prototype, "busyUntil", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'DRIVER' }),
    __metadata("design:type", String)
], Driver.prototype, "role", void 0);
exports.Driver = Driver = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Driver);
exports.DriverSchema = mongoose_1.SchemaFactory.createForClass(Driver);
exports.DriverSchema.index({ coordinates: '2dsphere' });
//# sourceMappingURL=driver.schema.js.map
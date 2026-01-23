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
exports.CreateBookingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class LocationDto {
    lat;
    lng;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LocationDto.prototype, "lat", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], LocationDto.prototype, "lng", void 0);
class OriginDestinationDto {
    location;
    address;
}
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LocationDto),
    __metadata("design:type", LocationDto)
], OriginDestinationDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OriginDestinationDto.prototype, "address", void 0);
class DistanceDto {
    text;
    value;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DistanceDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DistanceDto.prototype, "value", void 0);
class DurationDto {
    text;
    value;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DurationDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DurationDto.prototype, "value", void 0);
class WaypointDto {
    type;
    instruction;
    distance;
    duration;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WaypointDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WaypointDto.prototype, "instruction", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DistanceDto),
    __metadata("design:type", DistanceDto)
], WaypointDto.prototype, "distance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DurationDto),
    __metadata("design:type", DurationDto)
], WaypointDto.prototype, "duration", void 0);
class RouteDto {
    summary;
    polyline;
    waypoints;
    bounds;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RouteDto.prototype, "summary", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RouteDto.prototype, "polyline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WaypointDto),
    __metadata("design:type", Array)
], RouteDto.prototype, "waypoints", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], RouteDto.prototype, "bounds", void 0);
class PriceDto {
    baseFare;
    minimumFare;
    bookingFee;
    total;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceDto.prototype, "baseFare", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceDto.prototype, "minimumFare", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceDto.prototype, "bookingFee", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PriceDto.prototype, "total", void 0);
class UserInfoDto {
    date;
    time;
    name;
    scheduledDateTime;
    phone;
    email;
    address;
    bloodGroup;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "time", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "scheduledDateTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInfoDto.prototype, "bloodGroup", void 0);
class DriverPersonalInfoDto {
    dob;
    address;
    area;
    bloodGroup;
    emergencyContact;
    languages;
    certifications;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverPersonalInfoDto.prototype, "dob", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverPersonalInfoDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverPersonalInfoDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverPersonalInfoDto.prototype, "bloodGroup", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverPersonalInfoDto.prototype, "emergencyContact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], DriverPersonalInfoDto.prototype, "languages", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], DriverPersonalInfoDto.prototype, "certifications", void 0);
class FareStructureDto {
    baseFare;
    minimumFare;
    perKilometerRate;
    waitingChargePerMinute;
    cancellationFee;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FareStructureDto.prototype, "baseFare", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FareStructureDto.prototype, "minimumFare", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FareStructureDto.prototype, "perKilometerRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FareStructureDto.prototype, "waitingChargePerMinute", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], FareStructureDto.prototype, "cancellationFee", void 0);
class VehicleDetailsDto {
    _id;
    make;
    vehicleModel;
    vehicleType;
    vehicleClass;
    year;
    licensePlate;
    seatsNo;
    vehicleImages;
    driverId;
    fareStructure;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDetailsDto.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDetailsDto.prototype, "make", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDetailsDto.prototype, "vehicleModel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDetailsDto.prototype, "vehicleType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDetailsDto.prototype, "vehicleClass", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VehicleDetailsDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDetailsDto.prototype, "licensePlate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], VehicleDetailsDto.prototype, "seatsNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], VehicleDetailsDto.prototype, "vehicleImages", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDetailsDto.prototype, "driverId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => FareStructureDto),
    __metadata("design:type", FareStructureDto)
], VehicleDetailsDto.prototype, "fareStructure", void 0);
class DriverDetailsDto {
    _id;
    name;
    email;
    phone;
    imageUrl;
    drivinglicenseNo;
    agreement;
    personalInfo;
    vehicles;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverDetailsDto.prototype, "_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverDetailsDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverDetailsDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DriverDetailsDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverDetailsDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverDetailsDto.prototype, "drivinglicenseNo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Boolean)
], DriverDetailsDto.prototype, "agreement", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DriverPersonalInfoDto),
    __metadata("design:type", DriverPersonalInfoDto)
], DriverDetailsDto.prototype, "personalInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => VehicleDetailsDto),
    __metadata("design:type", Array)
], DriverDetailsDto.prototype, "vehicles", void 0);
class DriverDto {
    id;
    details;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DriverDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DriverDetailsDto),
    __metadata("design:type", DriverDetailsDto)
], DriverDto.prototype, "details", void 0);
class VehicleDto {
    id;
    details;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VehicleDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VehicleDetailsDto),
    __metadata("design:type", VehicleDetailsDto)
], VehicleDto.prototype, "details", void 0);
class CreateBookingDto {
    origin;
    destination;
    distance;
    duration;
    route;
    price;
    vehiclePreference;
    userInfo;
    paymentMethod;
    driver;
    vehicle;
    selectedDriverId;
    selectedVehicleId;
    passengers;
    userNotes;
}
exports.CreateBookingDto = CreateBookingDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => OriginDestinationDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", OriginDestinationDto)
], CreateBookingDto.prototype, "origin", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => OriginDestinationDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", OriginDestinationDto)
], CreateBookingDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DistanceDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", DistanceDto)
], CreateBookingDto.prototype, "distance", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DurationDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", DurationDto)
], CreateBookingDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => RouteDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", RouteDto)
], CreateBookingDto.prototype, "route", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PriceDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", PriceDto)
], CreateBookingDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "vehiclePreference", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => UserInfoDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", UserInfoDto)
], CreateBookingDto.prototype, "userInfo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DriverDto),
    __metadata("design:type", DriverDto)
], CreateBookingDto.prototype, "driver", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => VehicleDto),
    __metadata("design:type", VehicleDto)
], CreateBookingDto.prototype, "vehicle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "selectedDriverId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "selectedVehicleId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBookingDto.prototype, "passengers", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateBookingDto.prototype, "userNotes", void 0);
//# sourceMappingURL=create-booking.dto.js.map
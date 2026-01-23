"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearestDriversResponseDto = exports.DriverResponseDto = void 0;
class DriverResponseDto {
    driverId;
    driverName;
    vehicleType;
    vehicleDetails;
    distanceFromUser;
    rating;
    totalTrips;
    phoneNumber;
}
exports.DriverResponseDto = DriverResponseDto;
class NearestDriversResponseDto {
    drivers;
    totalFound;
    requestedVehicleType;
}
exports.NearestDriversResponseDto = NearestDriversResponseDto;
//# sourceMappingURL=nearest-drivers-response.dto.js.map
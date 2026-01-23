declare class LocationDto {
    lat: number;
    lng: number;
}
declare class OriginDestinationDto {
    location: LocationDto;
    address: string;
}
declare class DistanceDto {
    text: string;
    value: number;
}
declare class DurationDto {
    text: string;
    value: number;
}
declare class WaypointDto {
    type?: string;
    instruction?: string;
    distance?: DistanceDto;
    duration?: DurationDto;
}
declare class RouteDto {
    summary: string;
    polyline: string;
    waypoints?: WaypointDto[];
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
}
declare class PriceDto {
    baseFare?: number;
    minimumFare: number;
    bookingFee: number;
    total: number;
}
declare class UserInfoDto {
    date: string;
    time: string;
    name: string;
    scheduledDateTime: string;
    phone: string;
    email?: string;
    address?: string;
    bloodGroup?: string;
}
declare class DriverPersonalInfoDto {
    dob?: string;
    address?: string;
    area?: string;
    bloodGroup?: string;
    emergencyContact?: string;
    languages?: string[];
    certifications?: string[];
}
declare class FareStructureDto {
    baseFare?: number;
    minimumFare: number;
    perKilometerRate: number;
    waitingChargePerMinute: number;
    cancellationFee?: number;
}
declare class VehicleDetailsDto {
    _id?: string;
    make: string;
    vehicleModel: string;
    vehicleType: string;
    vehicleClass: string;
    year: number;
    licensePlate: string;
    seatsNo: number;
    vehicleImages?: any[];
    driverId: string;
    fareStructure: FareStructureDto;
}
declare class DriverDetailsDto {
    _id?: string;
    name: string;
    email: string;
    phone: number;
    imageUrl?: string;
    drivinglicenseNo: string;
    agreement?: boolean;
    personalInfo: DriverPersonalInfoDto;
    vehicles?: VehicleDetailsDto[];
}
declare class DriverDto {
    id: string;
    details: DriverDetailsDto;
}
declare class VehicleDto {
    id: string;
    details: VehicleDetailsDto;
}
export declare class CreateBookingDto {
    origin: OriginDestinationDto;
    destination: OriginDestinationDto;
    distance: DistanceDto;
    duration: DurationDto;
    route: RouteDto;
    price: PriceDto;
    vehiclePreference?: string;
    userInfo: UserInfoDto;
    paymentMethod: string;
    driver?: DriverDto;
    vehicle?: VehicleDto;
    selectedDriverId?: string;
    selectedVehicleId?: string;
    passengers?: number;
    userNotes?: string;
}
export {};

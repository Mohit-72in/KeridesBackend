import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    IsObject,
    ValidateNested,
    IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
    @IsNumber()
    lat: number;

    @IsNumber()
    lng: number;
}

class OriginDestinationDto {
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @IsString()
    address: string;
}

class DistanceDto {
    @IsString()
    text: string;

    @IsNumber()
    value: number;
}

class DurationDto {
    @IsString()
    text: string;

    @IsNumber()
    value: number;
}

class WaypointDto {
    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    instruction?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => DistanceDto)
    distance?: DistanceDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => DurationDto)
    duration?: DurationDto;
}

class RouteDto {
    @IsString()
    summary: string;

    @IsString()
    polyline: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WaypointDto)
    waypoints?: WaypointDto[];

    @IsOptional()
    @IsObject()
    bounds?: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
    };
}

class PriceDto {
    @IsOptional()
    @IsNumber()
    baseFare?: number;

    @IsNumber()
    minimumFare: number;

    @IsNumber()
    bookingFee: number;

    @IsNumber()
    total: number;
}

class UserInfoDto {
    @IsString()
    date: string;

    @IsString()
    time: string;

    @IsString()
    name: string;

    @IsString()
    scheduledDateTime: string;

    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    bloodGroup?: string;
}

// Driver personal info DTO
class DriverPersonalInfoDto {
    @IsOptional()
    @IsString()
    dob?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    area?: string;

    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @IsOptional()
    @IsString()
    emergencyContact?: string;

    @IsOptional()
    @IsArray()
    languages?: string[];

    @IsOptional()
    @IsArray()
    certifications?: string[];
}

// Fare structure DTO
class FareStructureDto {
    @IsOptional()
    @IsNumber()
    baseFare?: number;

    @IsNumber()
    minimumFare: number;

    @IsNumber()
    perKilometerRate: number;

    @IsNumber()
    waitingChargePerMinute: number;

    @IsOptional()
    @IsNumber()
    cancellationFee?: number;
}

// Vehicle details DTO
class VehicleDetailsDto {
    @IsOptional()
    @IsString()
    _id?: string;

    @IsString()
    make: string;

    @IsString()
    vehicleModel: string;

    @IsString()
    vehicleType: string;

    @IsString()
    vehicleClass: string;

    @IsNumber()
    year: number;

    @IsString()
    licensePlate: string;

    @IsNumber()
    seatsNo: number;

    @IsOptional()
    @IsArray()
    vehicleImages?: any[];

    @IsString()
    driverId: string;

    @ValidateNested()
    @Type(() => FareStructureDto)
    fareStructure: FareStructureDto;
}

// Driver details DTO
class DriverDetailsDto {
    @IsOptional()
    @IsString()
    _id?: string;

    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsNumber()
    phone: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsString()
    drivinglicenseNo: string;

    @IsOptional()
    @IsObject()
    agreement?: boolean;

    @ValidateNested()
    @Type(() => DriverPersonalInfoDto)
    personalInfo: DriverPersonalInfoDto;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VehicleDetailsDto)
    vehicles?: VehicleDetailsDto[];
}

// Driver object DTO (for embedding in booking)
class DriverDto {
    @IsString()
    id: string;

    @ValidateNested()
    @Type(() => DriverDetailsDto)
    details: DriverDetailsDto;
}

// Vehicle object DTO (for embedding in booking)
class VehicleDto {
    @IsString()
    id: string;

    @ValidateNested()
    @Type(() => VehicleDetailsDto)
    details: VehicleDetailsDto;
}

export class CreateBookingDto {
    @ValidateNested()
    @Type(() => OriginDestinationDto)
    @IsNotEmpty()
    origin: OriginDestinationDto;

    @ValidateNested()
    @Type(() => OriginDestinationDto)
    @IsNotEmpty()
    destination: OriginDestinationDto;

    @ValidateNested()
    @Type(() => DistanceDto)
    @IsNotEmpty()
    distance: DistanceDto;

    @ValidateNested()
    @Type(() => DurationDto)
    @IsNotEmpty()
    duration: DurationDto;

    @ValidateNested()
    @Type(() => RouteDto)
    @IsNotEmpty()
    route: RouteDto;

    @ValidateNested()
    @Type(() => PriceDto)
    @IsNotEmpty()
    price: PriceDto;

    @IsString()
    @IsOptional()
    vehiclePreference?: string;

    @ValidateNested()
    @Type(() => UserInfoDto)
    @IsNotEmpty()
    userInfo: UserInfoDto;

    @IsString()
    @IsNotEmpty()
    paymentMethod: string;

    // Driver information (optional, can be added during booking creation)
    @IsOptional()
    @ValidateNested()
    @Type(() => DriverDto)
    driver?: DriverDto;

    // Vehicle information (optional, can be added during booking creation)
    @IsOptional()
    @ValidateNested()
    @Type(() => VehicleDto)
    vehicle?: VehicleDto;

    // New fields for driver/vehicle selection
    @IsString()
    @IsOptional()
    selectedDriverId?: string;

    @IsString()
    @IsOptional()
    selectedVehicleId?: string;

    @IsNumber()
    @IsOptional()
    passengers?: number;

    @IsString()
    @IsOptional()
    userNotes?: string;
}


import {
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    IsObject,
    Min,
    Max,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DocumentsDto {
    @IsOptional()
    @IsString()
    Driving_Licence?: string;

    @IsOptional()
    @IsString()
    Police_Clearance_Certificate?: string;

    @IsOptional()
    @IsString()
    Proof_Of_Address?: string;

    @IsOptional()
    @IsString()
    Vehicle_Insurance_Proof?: string;
}

class FareStructureDto {
    @IsOptional()
    @IsNumber()
    @Min(0)
    minimumFare?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    perKilometerRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    waitingChargePerMinute?: number;
}

export class UpdateVehicleDto {
    @IsOptional()
    @IsString()
    make?: string;

    @IsOptional()
    @IsString()
    vehicleModel?: string;

    @IsOptional()
    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    seatsNo?: number;

    @IsOptional()
    @IsString()
    licensePlate?: string;

    @IsOptional()
    @IsString()
    vehicleType?: string;

    @IsOptional()
    @IsString()
    vehicleClass?: string;

    @IsOptional()
    @IsArray()
    vehicleImages?: string[];

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DocumentsDto)
    documents?: DocumentsDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => FareStructureDto)
    fareStructure?: FareStructureDto;
}

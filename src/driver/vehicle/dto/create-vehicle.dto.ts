import {
    IsString,
    IsNumber,
    IsArray,
    IsOptional,
    IsObject,
    Min,
    Max,
    IsNotEmpty,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DocumentsDto {
    @IsOptional()
    @IsString()
    Driving_Licence?: string;

    @IsOptional()
    @IsString()
    Vehicle_Insurance_Proof?: string;

    @IsOptional()
    @IsString()
    Proof_Of_Address?: string;

    @IsOptional()
    @IsString()
    Police_Clearance_Certificate?: string;
}

class FareStructureDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    minimumFare: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    perKilometerRate: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    waitingChargePerMinute: number;
}

export class CreateVehicleDto {
    @IsNotEmpty()
    @IsString()
    make: string;

    @IsNotEmpty()
    @IsString()
    vehicleModel: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    seatsNo: number;

    @IsNotEmpty()
    @IsString()
    licensePlate: string;

    @IsNotEmpty()
    @IsString()
    vehicleType: string;

    @IsNotEmpty()
    @IsString()
    vehicleClass: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    vehicleImages?: string[];

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => DocumentsDto)
    documents?: DocumentsDto;

    @IsNotEmpty()
    @IsObject()
    @ValidateNested()
    @Type(() => FareStructureDto)
    fareStructure: FareStructureDto;

    @IsOptional()
    @IsString()
    operatingArea?: string;
}
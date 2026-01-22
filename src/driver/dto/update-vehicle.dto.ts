import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class UpdateVehicleDto {
  // Vehicle Details
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;
@IsOptional()
    @IsNumber()
    @Min(1)
    seats?: number;

    @IsOptional()
    @IsString()
    licensePlate?: string;

    @IsOptional()
    @IsString()
    vehicleType?: string;

    @IsOptional()
    @IsString()
    vehicleClass?: string;

    // Fare & Fees
    @IsOptional()
    @IsNumber()
    @Min(0)
    baseFare?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    perKilometerRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minimumFare?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    waitingCharge?: number;

    // Documents
    @IsOptional()
    @IsString()
    licenseDocument?: string;

    @IsOptional()
    @IsString()
    insuranceDocument?: string;

    @IsOptional()
    @IsString()
    addressProofDocument?: string;

    @IsOptional()
    @IsString()
    policeCertificateDocument?: string;

    // Vehicle Images
    @IsOptional()
    @IsArray()
    vehicleImages?: string[];

    @IsOptional()
    isActive?: boolean;
}

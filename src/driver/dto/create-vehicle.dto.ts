import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class CreateVehicleDto {
  // Vehicle Details
  @IsNotEmpty()
  @IsString()
  make: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    seats: number;

    @IsNotEmpty()
    @IsString()
    licensePlate: string;

    @IsNotEmpty()
    @IsString()
    vehicleType: string;

    @IsNotEmpty()
    @IsString()
    vehicleClass: string;

    // Fare & Fees
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    baseFare: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    perKilometerRate: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    minimumFare: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  waitingCharge: number;

  // Documents (Optional for initial creation)
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

    // Vehicle Images (Optional for initial creation)
    @IsOptional()
    @IsArray()
    vehicleImages?: string[];
}

import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateRideRequestDto {
    @IsNotEmpty()
    @IsString()
    customerId: string;

    @IsNotEmpty()
    @IsString()
    pickupLocation: string;

    @IsNotEmpty()
    @IsString()
    dropoffLocation: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(-90)
    @Max(90)
    pickupLatitude: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(-180)
    @Max(180)
    pickupLongitude: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(-90)
    @Max(90)
    dropoffLatitude: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(-180)
    @Max(180)
    dropoffLongitude: number;

    @IsNumber()
    estimatedFare?: number;

    @IsNumber()
    estimatedDistance?: number;
}

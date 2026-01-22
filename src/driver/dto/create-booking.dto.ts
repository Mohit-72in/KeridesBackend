import {
    IsString,
    IsNumber,
    IsDate,
    IsOptional,
    IsEnum,
    Min,
    Max,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
    @IsNotEmpty()
    @IsString()
    vehicleId: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    pickupLocation: string;

    @IsNotEmpty()
    @IsString()
    dropoffLocation: string;

    @IsOptional()
    @IsNumber()
    pickupLatitude?: number;

    @IsOptional()
    @IsNumber()
    pickupLongitude?: number;

    @IsOptional()
    @IsNumber()
    dropoffLatitude?: number;

    @IsOptional()
    @IsNumber()
    dropoffLongitude?: number;

    @IsNotEmpty()
    @Type(() => Date)
    @IsDate()
    bookingTime: Date;

    @IsOptional()
    @IsNumber()
    estimatedDistance?: number;

    @IsOptional()
    @IsNumber()
    estimatedFare?: number;

    @IsOptional()
    @IsString()
    userNotes?: string;

    @IsOptional()
    @IsEnum(['CASH', 'CARD', 'WALLET', 'UPI'])
    paymentMethod?: string;
}

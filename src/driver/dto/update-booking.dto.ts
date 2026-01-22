import {
    IsString,
    IsNumber,
    IsDate,
    IsOptional,
    IsEnum,
    IsBoolean,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBookingDto {
    @IsOptional()
    @IsEnum([
        'PENDING',
        'ACCEPTED',
        'DRIVER_ARRIVED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
    ])
    status?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startTime?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endTime?: Date;

    @IsOptional()
    @IsNumber()
    actualDistance?: number;

    @IsOptional()
    @IsNumber()
    actualFare?: number;

    @IsOptional()
    @IsNumber()
    waitingTime?: number;

    @IsOptional()
    @IsNumber()
    waitingCharges?: number;

    @IsOptional()
    @IsString()
    driverNotes?: string;

    @IsOptional()
    @IsBoolean()
    paymentCompleted?: boolean;

    @IsOptional()
    @IsEnum(['CASH', 'CARD', 'WALLET', 'UPI'])
    paymentMethod?: string;

    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}

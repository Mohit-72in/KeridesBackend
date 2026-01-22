import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class FindNearestDriversDto {
    @IsNumber()
    @IsNotEmpty()
    pickupLatitude: number;

    @IsNumber()
    @IsNotEmpty()
    pickupLongitude: number;

    @IsString()
    @IsNotEmpty()
    vehicleType: string; // AUTO, CAR, BIKE, etc.
}

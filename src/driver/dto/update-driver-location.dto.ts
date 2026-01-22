import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdateDriverLocationDto {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsOptional()
    @IsBoolean()
    isOnline?: boolean;
}

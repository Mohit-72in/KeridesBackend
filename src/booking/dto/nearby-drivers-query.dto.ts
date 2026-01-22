import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class NearbyDriversQueryDto {
    @IsNumber()
    latitude: number;

    @IsNumber()
    longitude: number;

    @IsOptional()
    @IsNumber()
    @Min(0.1)
    @Max(50)
    radius?: number; // in kilometers, default 2km
}

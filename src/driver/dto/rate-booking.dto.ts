import { IsNumber, IsString, Min, Max, IsOptional } from 'class-validator';

export class RateBookingDto {
    @IsNumber()
    @Min(0)
    @Max(5) 
     rating: number;

  @IsOptional()
    @IsString()
    review?: string;
}

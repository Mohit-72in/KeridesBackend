import { IsString, IsOptional } from 'class-validator';

export class UpdateUserOperatingAreaDto {
    @IsString()
    operatingArea: string;

    @IsOptional()
    @IsString()
    address?: string;
}

import { IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    fullName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    phoneNumber?: string;

    @IsOptional()
    address?: string;

    @IsOptional()
    profileImage?: string;
}

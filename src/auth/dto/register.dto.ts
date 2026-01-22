import { IsEmail, IsNotEmpty, MinLength, ValidateIf, IsBoolean } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    phoneNumber: string;

    @MinLength(6)
    password: string;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    location: {
        latitude: number;
        longitude: number;
    };

    @IsBoolean()
    agreement: boolean;

    @IsNotEmpty()
    role: 'USER' | 'DRIVER';

    // Only if Driver
    @ValidateIf(o => o.role === 'DRIVER')
    @IsNotEmpty()
    phone?: string;

    @ValidateIf(o => o.role === 'DRIVER')
    @IsNotEmpty()
    licenseNumber?: string;
}

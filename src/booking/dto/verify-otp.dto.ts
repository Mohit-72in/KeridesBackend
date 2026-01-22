import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
    @IsString()
    @IsNotEmpty()
    @Length(4, 6)
    otp: string;
}

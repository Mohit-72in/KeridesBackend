import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNumber: string;

  @MinLength(6)
  password: string;
}

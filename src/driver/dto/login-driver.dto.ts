import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDriverDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

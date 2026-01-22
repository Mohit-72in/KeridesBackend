import { BadRequestException, Body, Controller, Post, Headers, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateDriverDto } from '../driver/dto/create-driver.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LoginDriverDto } from '../driver/dto/login-driver.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService, // <-- use real import for DI
  ) { }

  @Post('register-user')
  registerUser(@Body() dto: CreateUserDto) {
    return this.authService.registerUser(dto);
  }

  @Post('register-driver')
  registerDriver(@Body() dto: CreateDriverDto) {
    if (!dto.phoneNumber || !dto.driverLicenseNumber) {
      throw new BadRequestException('Phone Number & Driver License Number required');
    }
    return this.authService.registerDriver(dto);
  }

  @Post('login-user')
  loginUser(@Body() dto: LoginUserDto) {
    return this.authService.loginUser(dto);
  }

  @Post('login-driver')
  loginDriver(@Body() dto: LoginDriverDto) {
    return this.authService.loginDriver(dto);
  }

  /**
   * Dev-only: verify a token and return payload + fingerprint info to help
   * debug SIGN/VERIFY mismatches. Disabled in production.
   */
  @Post('debug/verify-token')
  async debugVerifyToken(@Body('token') token: string, @Headers('authorization') authHeader?: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }

    const supplied = token ?? (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7) // clearer than split
      : undefined);
    if (!supplied) {
      throw new BadRequestException('token is required in body or Authorization header');
    }

    const secretFp = require('crypto').createHash('sha256').update(process.env.JWT_SECRET || '').digest('hex').slice(0, 8);
    const tokenPrefix = supplied.slice(0, 8);

    try {
      const payload = (this as any).jwtService.verify(supplied);
      return { valid: true, payload, fingerprints: { verify: secretFp }, tokenPrefix };
    } catch (err: any) {
      return { valid: false, error: err.message, fingerprints: { verify: secretFp }, tokenPrefix };
    }
  }
}


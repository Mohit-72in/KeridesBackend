import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { DriverService } from '../driver/driver.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger('JwtStrategy');

  constructor(
    private readonly userService: UserService,
    private readonly driverService: DriverService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') ?? 'dev-secret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });

    const fp = require('crypto').createHash('sha256').update(secret || '').digest('hex').slice(0,8);
    this.logger.debug(`VERIFY secret fingerprint=${fp}`);
  }

  /**
   * Validate verifies token signature (handled by passport) then we ensure
   * the referenced user/driver still exists. This prevents valid tokens from
   * being accepted for deleted/disabled accounts and provides clearer logs.
   */
  async validate(payload: any) {
    this.logger.debug(`JWT Payload: ${JSON.stringify(payload)}`);

    if (!payload || !payload.id || !payload.role) {
      this.logger.warn('Invalid JWT payload');
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.role === 'USER') {
      const user = await this.userService.findById(payload.id);
      if (!user) {
        this.logger.warn(`User not found for id=${payload.id}`);
        throw new UnauthorizedException('User not found');
      }
      return { id: payload.id, role: payload.role };
    }

    if (payload.role === 'DRIVER') {
      const driver = await this.driverService.findById(payload.id);
      if (!driver) {
        this.logger.warn(`Driver not found for id=${payload.id}`);
        throw new UnauthorizedException('Driver not found');
      }
      return { id: payload.id, role: payload.role };
    }

    this.logger.warn(`Unsupported role in token: ${payload.role}`);
    throw new UnauthorizedException('Invalid token role');
  }
}
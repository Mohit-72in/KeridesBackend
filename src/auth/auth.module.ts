import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { DriverModule } from '../driver/driver.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (cfg: ConfigService) => {
        const expiresIn = cfg.get<number | string>('JWT_EXPIRES_IN') ?? '24h';
        const options = {
          secret: cfg.get<string>('JWT_SECRET'),
          signOptions: { expiresIn },
        } as unknown as import('@nestjs/jwt').JwtModuleOptions;
        return options;
      },
    }),
    UserModule,
    DriverModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule { }

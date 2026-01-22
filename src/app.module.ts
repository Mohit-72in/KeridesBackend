import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DriverModule } from './driver/driver.module';
import { BookingModule } from './booking/booking.module';
import { HttpLoggingMiddleware } from './common/middleware/http-logging.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI as string, {
      dbName: process.env.DB_NAME || 'dbnew',
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }),

    AuthModule,
    UserModule,
    DriverModule,
    BookingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggingMiddleware).forRoutes('*');
  }
}

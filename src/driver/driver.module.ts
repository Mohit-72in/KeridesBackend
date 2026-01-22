import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { Driver, DriverSchema } from '../schemas/driver.schema';
import { JwtModule } from '@nestjs/jwt';
import { VehicleModule } from './vehicle/vehicle.module';
import { DateTransformer } from '../common/transformers/date.transformer';
import { S3Service } from '../common/services/s3.service';
import { DriverNotificationService } from '../common/services/driver-notification.service';
import { LocationController } from './location.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
    ]),
    JwtModule,
    VehicleModule,
  ],
  controllers: [DriverController, LocationController],
  providers: [DriverService, DateTransformer, S3Service, DriverNotificationService],
  exports: [DriverService, DriverNotificationService],
})
export class DriverModule { }

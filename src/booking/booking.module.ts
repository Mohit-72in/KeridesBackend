/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { Driver, DriverSchema } from '../schemas/driver.schema';
import { Vehicle, VehicleSchema } from '../schemas/vehicle.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { RideService } from './ride.service';
import { RideController } from './ride.controller';
import { DriverModule } from '../driver/driver.module';
import { DriverNotificationService } from '../common/services/driver-notification.service';
import { MailService } from '../common/services/mail.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Booking.name, schema: BookingSchema },
            { name: Driver.name, schema: DriverSchema },
            { name: Vehicle.name, schema: VehicleSchema },
            { name: User.name, schema: UserSchema },
        ]),
        DriverModule,
    ],
    providers: [BookingService, RideService, DriverNotificationService, MailService],
    controllers: [BookingController, RideController],
    exports: [BookingService, RideService],
})
export class BookingModule { }

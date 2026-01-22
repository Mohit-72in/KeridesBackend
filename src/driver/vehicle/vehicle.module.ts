import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { Vehicle, VehicleSchema } from '../../schemas/vehicle.schema';
import { S3Service } from '../../common/services/s3.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vehicle.name, schema: VehicleSchema },
        ]),
    ],
    controllers: [VehicleController],
    providers: [VehicleService, S3Service],
    exports: [VehicleService],
})
export class VehicleModule { }

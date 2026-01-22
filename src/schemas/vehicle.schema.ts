import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { Driver } from './driver.schema';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle extends Document {
    @Prop()
    make: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: 'Driver', required: true })
    driverId: Driver;

    @Prop()
    vehicleModel: string;

    @Prop()
    year: number;

    @Prop()
    seatsNo: number;

    @Prop()
    licensePlate: string;

    @Prop()
    vehicleClass: string;

    @Prop()
    vehicleType: string;

    @Prop([String])
    vehicleImages: string[];

    @Prop({ type: Object, default: {} })
    documents: {
        Driving_Licence?: string;
        Police_Clearance_Certificate?: string;
        Proof_Of_Address?: string;
        Vehicle_Insurance_Proof?: string;
    };

    @Prop({ type: Object })
    fareStructure: {
        minimumFare: number;
        perKilometerRate: number;
        waitingChargePerMinute: number;
    };

    @Prop()
    operatingArea?: string;

    @Prop({ default: 4.5, min: 0, max: 5 })
    rating: number;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

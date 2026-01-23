import { Document } from 'mongoose';
import { Driver } from './driver.schema';
export type VehicleDocument = Vehicle & Document;
export declare class Vehicle extends Document {
    make: string;
    driverId: Driver;
    vehicleModel: string;
    year: number;
    seatsNo: number;
    licensePlate: string;
    vehicleClass: string;
    vehicleType: string;
    vehicleImages: string[];
    documents: {
        Driving_Licence?: string;
        Police_Clearance_Certificate?: string;
        Proof_Of_Address?: string;
        Vehicle_Insurance_Proof?: string;
    };
    fareStructure: {
        minimumFare: number;
        perKilometerRate: number;
        waitingChargePerMinute: number;
    };
    operatingArea?: string;
    rating: number;
}
export declare const VehicleSchema: import("mongoose").Schema<Vehicle, import("mongoose").Model<Vehicle, any, any, any, Document<unknown, any, Vehicle, any, {}> & Vehicle & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vehicle, Document<unknown, {}, import("mongoose").FlatRecord<Vehicle>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Vehicle> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;

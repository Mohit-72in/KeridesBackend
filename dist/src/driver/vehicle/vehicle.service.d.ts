import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '../../schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehicleService {
    private vehicleModel;
    constructor(vehicleModel: Model<VehicleDocument>);
    createVehicle(driverId: string, createVehicleDto: CreateVehicleDto): Promise<import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getDriverVehicles(driverId: string): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAllAvailableVehicles(): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAllVehicles(): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getVehicleById(vehicleId: string): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateVehicle(vehicleId: string, updateVehicleDto: UpdateVehicleDto): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    deleteVehicle(vehicleId: string): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    addVehicleDocument(vehicleId: string, documentType: string, documentUrl: string): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    addVehicleImages(vehicleId: string, imageUrls: string[]): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    removeVehicleImage(vehicleId: string, imageUrl: string): Promise<(import("mongoose").Document<unknown, {}, VehicleDocument, {}, {}> & Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
}

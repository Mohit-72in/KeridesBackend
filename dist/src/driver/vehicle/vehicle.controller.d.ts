import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { S3Service } from '../../common/services/s3.service';
export declare class VehicleController {
    private readonly vehicleService;
    private readonly s3Service;
    constructor(vehicleService: VehicleService, s3Service: S3Service);
    getAllAvailableVehicles(): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    createVehicle(req: any, createVehicleDto: CreateVehicleDto): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getMyVehicles(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getVehicleById(vehicleId: string): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateVehicle(vehicleId: string, updateVehicleDto: UpdateVehicleDto): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    deleteVehicle(vehicleId: string): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    uploadDocument(vehicleId: string, documentType: string, documentUrl: string): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    addVehicleImages(vehicleId: string, imageUrls: string[]): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    removeVehicleImage(vehicleId: string, imageUrl: string): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/vehicle.schema").VehicleDocument, {}, {}> & import("../../schemas/vehicle.schema").Vehicle & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    uploadVehicleDocument(vehicleId: string, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
        key: string;
        size: number;
        type: string;
    }>;
    uploadVehicleImage(vehicleId: string, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
        key: string;
        size: number;
        type: string;
    }>;
}

import { Model } from 'mongoose';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DateTransformer } from '../common/transformers/date.transformer';
export declare class DriverService {
    private driverModel;
    private dateTransformer;
    constructor(driverModel: Model<DriverDocument>, dateTransformer: DateTransformer);
    create(dto: any): Promise<Driver>;
    findByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findById(id: string): Promise<(import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateDriver(id: string, updateDto: UpdateDriverDto): Promise<(import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    resetCollection(): Promise<{
        message: string;
    }>;
    addDocument(driverId: string, documentData: {
        url: string;
        key: string;
        fileName: string;
        fileType: string;
    }): Promise<(import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateDriverLocation(driverId: string, latitude: number, longitude: number, isOnline?: boolean): Promise<(import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateDriverGeoLocation(driverId: string, latitude: number, longitude: number, isOnline?: boolean): Promise<(import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    goOffline(driverId: string): Promise<(import("mongoose").Document<unknown, {}, DriverDocument, {}, {}> & Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    private static DEFAULT_NEARBY_DRIVERS_RADIUS_KM;
    private static DEFAULT_NEARBY_DRIVERS_LIMIT;
    getNearbyDrivers(latitude: number, longitude: number, radiusKm?: number): Promise<(import("mongoose").FlattenMaps<DriverDocument> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAllDrivers(filter?: {
        isOnline?: boolean;
        area?: string;
    }, page?: number, limit?: number): Promise<{
        items: (import("mongoose").FlattenMaps<DriverDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    private calculateDistance;
    private toRad;
}

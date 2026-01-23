import type { Response } from 'express';
import { DriverService } from './driver.service';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateDriverLocationDto } from './dto/update-driver-location.dto';
import { S3Service } from '../common/services/s3.service';
import { DriverNotificationService } from '../common/services/driver-notification.service';
export declare class DriverController {
    private readonly driverService;
    private readonly s3Service;
    private readonly notificationService;
    constructor(driverService: DriverService, s3Service: S3Service, notificationService: DriverNotificationService);
    profile(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/driver.schema").DriverDocument, {}, {}> & import("../schemas/driver.schema").Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateDriver(req: any, updateDto: UpdateDriverDto): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/driver.schema").DriverDocument, {}, {}> & import("../schemas/driver.schema").Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    uploadDocument(req: any, file: Express.Multer.File): Promise<{
        message: string;
        url: string;
        key: string;
        size: number;
        type: string;
        driver: (import("mongoose").Document<unknown, {}, import("../schemas/driver.schema").DriverDocument, {}, {}> & import("../schemas/driver.schema").Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    resetDrivers(): Promise<{
        message: string;
    }>;
    getAllDrivers(isOnline?: string, area?: string, page?: string, limit?: string): Promise<{
        items: (import("mongoose").FlattenMaps<import("../schemas/driver.schema").DriverDocument> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateDriverLocation(req: any, locationDto: UpdateDriverLocationDto): Promise<{
        message: string;
        driver: (import("mongoose").Document<unknown, {}, import("../schemas/driver.schema").DriverDocument, {}, {}> & import("../schemas/driver.schema").Driver & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    subscribeToBookings(req: any, res: Response): void;
    getNotificationStatus(req: any): {
        driverId: any;
        isConnected: boolean;
        message: string;
    };
}

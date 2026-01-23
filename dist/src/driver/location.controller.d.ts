import { DriverService } from './driver.service';
export declare class LocationController {
    private driverService;
    private logger;
    constructor(driverService: DriverService);
    updateLocation(req: any, body: {
        latitude: number;
        longitude: number;
        isOnline?: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        latitude?: undefined;
        longitude?: undefined;
        isOnline?: undefined;
        timestamp?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        latitude: number;
        longitude: number;
        isOnline: boolean | undefined;
        timestamp: Date;
        error?: undefined;
    } | {
        success: boolean;
        message: string;
        error: any;
        latitude?: undefined;
        longitude?: undefined;
        isOnline?: undefined;
        timestamp?: undefined;
    }>;
    goOnline(req: any, body: {
        latitude: number;
        longitude: number;
    }): Promise<{
        success: boolean;
        message: string;
        isOnline?: undefined;
    } | {
        success: boolean;
        message: string;
        isOnline: boolean;
    }>;
    goOffline(req: any): Promise<{
        success: boolean;
        message: string;
        isOnline: boolean;
    }>;
}

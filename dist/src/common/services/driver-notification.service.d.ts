import { Response } from 'express';
export declare class DriverNotificationService {
    private logger;
    private activeSubscriptions;
    subscribeDriver(driverId: string, response: Response): void;
    notifyDriver(driverId: string, bookingData: any): boolean;
    notifyMultipleDrivers(driverIds: string[], bookingData: any): {
        sent: number;
        failed: number;
    };
    isDriverConnected(driverId: string): boolean;
    getConnectedDrivers(): string[];
    getConnectionStats(): {
        totalConnections: number;
        connectedDrivers: string[];
        connectionDetails: {
            driverId: string;
            connectedSince: Date;
            connectionDuration: number;
        }[];
    };
    disconnectDriver(driverId: string): boolean;
    disconnectAll(): void;
}

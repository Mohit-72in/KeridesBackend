import { Document } from 'mongoose';
export type DriverDocument = Driver & Document;
export declare class Driver {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    driverLicenseNumber: string;
    address?: string;
    profileImage?: string;
    personalInfo: {
        bloodGroup?: string;
        certificates?: string[];
        dob?: Date;
        emergencyContact?: {
            name: string;
            phone: string;
            relationship: string;
        };
        languages?: string[];
    };
    drivingExperience: {
        yearsOfExperience?: number;
        licensedSince?: Date;
        totalTripsCompleted?: number;
        averageRating?: number;
    };
    documents?: Array<{
        url: string;
        key: string;
        uploadedAt: Date;
        fileName: string;
        fileType: string;
    }>;
    operatingArea?: string;
    latitude?: number;
    longitude?: number;
    locationFieldType?: string;
    coordinates?: [number, number];
    isOnline?: boolean;
    lastLocationUpdate?: Date;
    busyUntil?: Date;
    role: string;
}
export declare const DriverSchema: import("mongoose").Schema<Driver, import("mongoose").Model<Driver, any, any, any, Document<unknown, any, Driver, any, {}> & Driver & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Driver, Document<unknown, {}, import("mongoose").FlatRecord<Driver>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Driver> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;

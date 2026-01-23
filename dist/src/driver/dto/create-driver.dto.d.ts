export declare class CreateDriverDto {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    driverLicenseNumber: string;
    personalInfo?: {
        bloodGroup?: string;
        certificates?: string[];
        dob?: string;
        emergencyContact?: {
            name: string;
            phone: string;
            relationship: string;
        };
        languages?: string[];
    };
    drivingExperience?: {
        yearsOfExperience?: number;
        licensedSince?: string;
        totalTripsCompleted?: number;
        averageRating?: number;
    };
    latitude?: number;
    longitude?: number;
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    address?: string;
    operatingArea?: string;
}

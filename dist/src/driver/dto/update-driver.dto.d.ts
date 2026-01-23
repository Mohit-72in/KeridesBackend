export declare class UpdateDriverDto {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    driverLicenseNumber?: string;
    profileImage?: string;
    agreement?: boolean;
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
}

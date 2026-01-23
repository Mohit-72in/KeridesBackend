export declare class DriverResponseDto {
    driverId: string;
    driverName: string;
    vehicleType: string;
    vehicleDetails: {
        make: string;
        vehicleModel: string;
        year: number;
        licensePlate: string;
        seatsNo: number;
        vehicleImages?: string[];
    };
    distanceFromUser: number;
    rating?: number;
    totalTrips?: number;
    phoneNumber?: string;
}
export declare class NearestDriversResponseDto {
    drivers: DriverResponseDto[];
    totalFound: number;
    requestedVehicleType: string;
}

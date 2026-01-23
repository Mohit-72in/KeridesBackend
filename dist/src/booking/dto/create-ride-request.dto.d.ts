export declare class CreateRideRequestDto {
    customerId: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupLatitude: number;
    pickupLongitude: number;
    dropoffLatitude: number;
    dropoffLongitude: number;
    estimatedFare?: number;
    estimatedDistance?: number;
}

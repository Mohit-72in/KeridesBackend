export declare class CreateBookingDto {
    vehicleId: string;
    userId: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    dropoffLatitude?: number;
    dropoffLongitude?: number;
    bookingTime: Date;
    estimatedDistance?: number;
    estimatedFare?: number;
    userNotes?: string;
    paymentMethod?: string;
}

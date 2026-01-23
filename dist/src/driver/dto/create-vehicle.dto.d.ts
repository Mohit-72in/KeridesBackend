export declare class CreateVehicleDto {
    make: string;
    model: string;
    year: number;
    seats: number;
    licensePlate: string;
    vehicleType: string;
    vehicleClass: string;
    baseFare: number;
    perKilometerRate: number;
    minimumFare: number;
    waitingCharge: number;
    licenseDocument?: string;
    insuranceDocument?: string;
    addressProofDocument?: string;
    policeCertificateDocument?: string;
    vehicleImages?: string[];
}
